from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Story, LeaderboardEntry, Badge, GameSession
from accounts.models import UserProfile
from .serializers import StorySerializer, LeaderboardEntrySerializer, UserProfileSerializer, BadgeSerializer, GameSessionSerializer
from django.db.models import Max

class StoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

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
        profile = user.profile  # Changed from user.userprofile to user.profile
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