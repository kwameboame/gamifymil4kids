from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (StoryViewSet, LeaderboardEntryViewSet, UserProfileViewSet, 
                    LevelViewSet, ActionViewSet, BadgeViewSet, ScenarioViewSet,
                    GameSessionViewSet, GameInviteViewSet, AnimationViewSet)

router = DefaultRouter()
router.register(r'stories', StoryViewSet)
router.register(r'leaderboard', LeaderboardEntryViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'badges', BadgeViewSet)
router.register(r'game-sessions', GameSessionViewSet)
router.register(r'invites', GameInviteViewSet, basename='gameinvite')
router.register(r'animations', AnimationViewSet, basename='animation')

urlpatterns = [
    path('', include(router.urls)),
    path('stories/<int:story_id>/levels/', LevelViewSet.as_view({'get': 'list'}), name='story-levels'),
    path('stories/<int:story_id>/levels/<int:level_id>/scenarios/', ScenarioViewSet.as_view({'get': 'list'}), name='level-scenarios'),
    path('scenarios/<int:scenario_id>/actions/', ActionViewSet.as_view({'get': 'list'}), name='scenario-actions'),
]