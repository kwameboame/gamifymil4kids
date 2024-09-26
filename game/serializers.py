from rest_framework import serializers
from .models import Story, Level, Action, LeaderboardEntry, UserProfile

class ActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Action
        fields = ['id', 'text', 'is_correct']

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
    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'name', 'score', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'name', 'high_scores', 'badges']