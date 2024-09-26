from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoryViewSet, LeaderboardEntryViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'stories', StoryViewSet)
router.register(r'leaderboard', LeaderboardEntryViewSet)
router.register(r'profiles', UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]