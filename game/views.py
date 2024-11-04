from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Story, Scenario, Level, Action, LeaderboardEntry, Badge, GameSession, GameInvite
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
    GameInviteSerializer
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