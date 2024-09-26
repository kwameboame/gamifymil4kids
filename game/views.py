from rest_framework import viewsets
from .models import Story, LeaderboardEntry, UserProfile
from .serializers import StorySerializer, LeaderboardEntrySerializer, UserProfileSerializer

class StoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

class LeaderboardEntryViewSet(viewsets.ModelViewSet):
    queryset = LeaderboardEntry.objects.all().order_by('-score')
    serializer_class = LeaderboardEntrySerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer