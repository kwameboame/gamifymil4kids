from rest_framework import serializers
from .models import Story, Level, Action, LeaderboardEntry, Badge, GameSession
from accounts.models import UserProfile

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = ['id', 'text', 'is_correct', 'points']

class LevelSerializer(serializers.ModelSerializer):
    actions = ActionSerializer(many=True, read_only=True)

    class Meta:
        model = Level
        fields = ['id', 'prompt', 'image', 'order', 'actions']

class StorySerializer(serializers.ModelSerializer):
    levels = LevelSerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = ['id', 'title', 'description', 'levels']

class LeaderboardEntrySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'username', 'score', 'created_at']
        read_only_fields = ['user', 'created_at']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'image']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    badges = BadgeSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'notifications', 'entry_thumbnail', 'image_thumbnail', 'post_thumb', 'high_scores', 'badges']

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'story', 'score', 'completed', 'start_time', 'end_time']