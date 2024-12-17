from rest_framework import serializers
from .models import Story, Level, Scenario, Action, LeaderboardEntry, Badge, GameSession, GameInvite, Outcome
from accounts.models import UserProfile

class OutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Outcome
        fields = ['id', 'text']

class ActionSerializer(serializers.ModelSerializer):
    outcome = OutcomeSerializer(read_only=True)
    
    class Meta:
        model = Action
        fields = ['id', 'text', 'is_correct', 'points', 'outcome']

class LevelSerializer(serializers.ModelSerializer):

    class Meta:
        model = Level
        fields = ['id', 'title', 'story', 'image', 'order']

class ScenarioSerializer(serializers.ModelSerializer):
    actions = ActionSerializer(many=True, read_only=True)

    class Meta:
        model = Scenario
        fields = ['id', 'story', 'level', 'description', 'image', 'order', 'actions']

class StorySerializer(serializers.ModelSerializer):
    levels = LevelSerializer(many=True, read_only=True)
    scenarios = ScenarioSerializer(many=True, read_only=True)

    class Meta:
        model = Story
        fields = ['id', 'title', 'description', 'image', 'levels', 'scenarios']

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

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'story', 'score', 'completed', 'start_time', 'end_time']

class GameInviteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameInvite
        fields = ['id', 'inviter', 'story', 'token', 'created_at', 'expires_at']
        read_only_fields = ['id', 'inviter', 'token', 'created_at', 'expires_at']