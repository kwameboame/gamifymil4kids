from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoryViewSet, LeaderboardEntryViewSet, UserProfileViewSet, BadgeViewSet, GameSessionViewSet

router = DefaultRouter()
router.register(r'stories', StoryViewSet)
router.register(r'leaderboard', LeaderboardEntryViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'game-sessions', GameSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]