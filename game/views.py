from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Story, Scenario, Level, Action, LeaderboardEntry, Badge, GameSession, GameInvite, Animation, UserProgress, PowerUp, UserPowerUp, PowerUpType
from accounts.models import UserProfile
from accounts.serializers import UserProfileSerializer
from .serializers import (
    StorySerializer,
    ScenarioSerializer,
    LevelSerializer,
    ActionSerializer,
    LeaderboardEntrySerializer,
    BadgeSerializer,
    GameSessionSerializer,
    GameInviteSerializer,
    AnimationSerializer,
    UserProgressSerializer,
    PowerUpSerializer,
    UserPowerUpSerializer
)
from django.db.models import Max
from rest_framework.permissions import IsAuthenticated

class StoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer
    
class LevelViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LevelSerializer

    def get_queryset(self):
        # Get the `story_id` from the URL kwargs
        story_id = self.kwargs.get('story_id')
        if story_id:
            # Filter levels to only those associated with the given story_id
            return Level.objects.filter(story__id=story_id)
        # Default queryset if no story_id is provided (though this should never be the case here)
        return Level.objects.none()


class ScenarioViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ScenarioSerializer

    def get_queryset(self):
        story_id = self.kwargs.get('story_id')
        level_id = self.kwargs.get('level_id')
        if story_id and level_id:
            return Scenario.objects.filter(story__id=story_id, level__id=level_id)
        return Scenario.objects.all()

class ActionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Action.objects.all()
    serializer_class = ActionSerializer

class LeaderboardEntryViewSet(viewsets.ModelViewSet):
    queryset = LeaderboardEntry.objects.all().order_by('-score')
    serializer_class = LeaderboardEntrySerializer

    def create(self, request):
        user = request.user
        story_id = request.data.get('story_id')
        score = request.data.get('score')

        if not story_id or score is None:
            return Response({'error': 'Both story_id and score are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            return Response({'error': 'Story not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Ensure score is an integer
        try:
            score = int(score)
        except ValueError:
            return Response({'error': 'Score must be an integer.'}, status=status.HTTP_400_BAD_REQUEST)

        entry, created = LeaderboardEntry.objects.update_or_create(
            user=user,
            story=story,
            defaults={'score': score}
        )

        # Update user's high score for this story
        profile = user.profile
        if str(story_id) not in profile.high_scores or score > profile.high_scores.get(str(story_id), 0):
            profile.high_scores[str(story_id)] = score
            profile.save()

        return Response(LeaderboardEntrySerializer(entry).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='top-scores')
    def top_scores(self, request):
        # Aggregate the highest score per user across all stories
        top_entries = LeaderboardEntry.objects.values('user__username').annotate(highest_score=Max('score')).order_by('-highest_score')

        # Format the response to match the frontend's expectations
        formatted_entries = [
            {'username': entry['user__username'], 'score': entry['highest_score']}
            for entry in top_entries
        ]

        return Response(formatted_entries, status=status.HTTP_200_OK)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer

    @action(detail=True, methods=['post'])
    def award_badge(self, request, pk=None):
        user = request.user
        badge = self.get_object()

        if badge in user.profile.badges.all():
            return Response({'error': 'User already has this badge.'}, status=status.HTTP_400_BAD_REQUEST)

        user.profile.badges.add(badge)
        return Response({'success': f'Badge {badge.name} awarded to {user.username}.'})

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GameInviteViewSet(viewsets.ModelViewSet):
    queryset = GameInvite.objects.all()
    serializer_class = GameInviteSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(inviter=self.request.user)
    
    @action(detail=True, methods=['get'], url_path='inviter-score')
    def inviter_score(self, request, pk=None):
        try:
            invite = self.get_object()
            if invite.is_expired():
                return Response({'error': 'Invite has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            inviter_profile = invite.inviter.profile
            # Assuming high_scores holds story IDs as strings
            story_id_str = str(invite.story.id)
            highest_score = inviter_profile.high_scores.get(story_id_str, 0)
            return Response({'username': invite.inviter.username, 'highest_score': highest_score}, status=status.HTTP_200_OK)
        except GameInvite.DoesNotExist:
            return Response({'error': 'Invite does not exist.'}, status=status.HTTP_404_NOT_FOUND)

class AnimationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for retrieving animations based on story and animation type.
    Animations can be filtered by story_id and animation_type.
    """
    queryset = Animation.objects.filter(is_active=True)
    serializer_class = AnimationSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        story_id = self.request.query_params.get('story_id')
        animation_type = self.request.query_params.get('animation_type')
        
        if story_id:
            queryset = queryset.filter(story_id=story_id)
        if animation_type:
            queryset = queryset.filter(animation_type=animation_type)
            
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    @action(detail=False, methods=['get'], url_path='by-type/(?P<animation_type>[^/.]+)')
    def by_type(self, request, animation_type=None):
        """
        Get animations of a specific type for a story.
        Required query parameter: story_id
        """
        story_id = request.query_params.get('story_id')
        if not story_id:
            return Response({'error': 'story_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            return Response({'error': 'Story not found'}, status=status.HTTP_404_NOT_FOUND)
        
        animation = Animation.objects.filter(
            story_id=story_id, 
            animation_type=animation_type,
            is_active=True
        ).first()
        
        if not animation:
            return Response({'error': f'No {animation_type} animation found for this story'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(animation)
        return Response(serializer.data)


class UserProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user game progress.
    Provides endpoints to save and retrieve detailed game state.
    """
    serializer_class = UserProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='save-progress')
    def save_progress(self, request):
        """
        Save the current game progress for the authenticated user.
        Required: story_id, level, score, lives, scenario_index
        Optional: state_data for additional game state
        """
        story_id = request.data.get('story_id')
        if not story_id:
            return Response({'error': 'story_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            return Response({'error': 'Story not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Required fields
        level = request.data.get('level', 0)
        score = request.data.get('score', 0)
        lives = request.data.get('lives', 3)
        scenario_index = request.data.get('scenario_index', 0)
        
        # Optional additional state
        state_data = request.data.get('state_data', {})
        
        # Update or create progress
        progress, created = UserProgress.objects.update_or_create(
            user=request.user,
            story=story,
            defaults={
                'level': level,
                'score': score,
                'lives': lives,
                'scenario_index': scenario_index,
                'state_data': state_data
            }
        )
        
        return Response(
            UserProgressSerializer(progress).data, 
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='get-progress')
    def get_progress(self, request):
        """
        Get the saved game progress for the authenticated user.
        Required query parameter: story_id
        """
        story_id = request.query_params.get('story_id')
        if not story_id:
            return Response({'error': 'story_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            progress = UserProgress.objects.get(user=request.user, story_id=story_id)
            return Response(UserProgressSerializer(progress).data)
        except UserProgress.DoesNotExist:
            return Response(
                {'message': 'No saved progress found for this story'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PowerUpViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing power-ups in the game.
    Provides CRUD operations for power-ups, with filtering by story.
    """
    queryset = PowerUp.objects.all()
    serializer_class = PowerUpSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = PowerUp.objects.filter(is_active=True)
        story_id = self.request.query_params.get('story_id')
        power_up_type = self.request.query_params.get('type')
        
        if story_id:
            queryset = queryset.filter(story_id=story_id)
        
        if power_up_type:
            queryset = queryset.filter(power_up_type=power_up_type)
            
        return queryset
    
    @action(detail=False, methods=['get'], url_path='by-story/(?P<story_id>[^/.]+)')
    def by_story(self, request, story_id=None):
        """
        Get all power-ups for a specific story.
        """
        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            return Response({'error': 'Story not found'}, status=status.HTTP_404_NOT_FOUND)
            
        power_ups = PowerUp.objects.filter(story_id=story_id, is_active=True)
        serializer = self.get_serializer(power_ups, many=True)
        return Response(serializer.data)


class UserPowerUpViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user's power-ups.
    Provides endpoints to earn, use, and view power-ups for a user.
    """
    serializer_class = UserPowerUpSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserPowerUp.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='earn')
    def earn_power_up(self, request):
        """
        Earn a power-up based on the number of correct answers.
        Required: story_id, power_up_id, correct_answer_count, level, scenario
        """
        story_id = request.data.get('story_id')
        power_up_id = request.data.get('power_up_id')
        correct_answer_count = request.data.get('correct_answer_count', 0)
        level = request.data.get('level', 0)
        scenario = request.data.get('scenario', 0)
        game_session_id = request.data.get('game_session_id')
        
        if not story_id or not power_up_id:
            return Response({'error': 'story_id and power_up_id are required'}, 
                           status=status.HTTP_400_BAD_REQUEST)
            
        try:
            power_up = PowerUp.objects.get(id=power_up_id, is_active=True)
        except PowerUp.DoesNotExist:
            return Response({'error': 'Power-up not found or inactive'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user has enough correct answers to earn this power-up
        if correct_answer_count < power_up.required_correct_answers:
            return Response(
                {'error': f'Not enough correct answers. Required: {power_up.required_correct_answers}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Prepare game_session if provided
        game_session = None
        if game_session_id:
            try:
                game_session = GameSession.objects.get(id=game_session_id, user=request.user)
            except GameSession.DoesNotExist:
                return Response({'error': 'Game session not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create the user power-up
        user_power_up = UserPowerUp.objects.create(
            user=request.user,
            power_up=power_up,
            game_session=game_session,
            earned_level=level,
            earned_scenario=scenario,
            correct_answer_count=correct_answer_count
        )
        
        return Response(UserPowerUpSerializer(user_power_up).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], url_path='use')
    def use_power_up(self, request, pk=None):
        """
        Use a power-up that the user has earned.
        """
        try:
            user_power_up = UserPowerUp.objects.get(pk=pk, user=request.user, is_active=True)
        except UserPowerUp.DoesNotExist:
            return Response({'error': 'Power-up not found or already used'}, 
                           status=status.HTTP_404_NOT_FOUND)
        
        # Mark as used
        user_power_up.use()
        
        # Return the power-up's effects
        power_up = user_power_up.power_up
        effects = {
            'bonus_lives': power_up.bonus_lives,
            'score_multiplier': power_up.score_multiplier,
            'time_extension_seconds': power_up.time_extension_seconds,
            'type': power_up.power_up_type
        }
        
        return Response({
            'message': f'Successfully used "{power_up.name}" power-up',
            'effects': effects,
            'power_up': UserPowerUpSerializer(user_power_up).data
        })
    
    @action(detail=False, methods=['get'], url_path='active')
    def active_power_ups(self, request):
        """
        Get all active (unused) power-ups for the user.
        Optional query parameter: story_id to filter by story
        """
        story_id = request.query_params.get('story_id')
        queryset = UserPowerUp.objects.filter(user=request.user, is_active=True)
        
        if story_id:
            queryset = queryset.filter(power_up__story_id=story_id)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)