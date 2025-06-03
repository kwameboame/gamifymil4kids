from rest_framework import serializers
import random
from .models import Story, Level, Scenario, Action, LeaderboardEntry, Badge, GameSession, GameInvite, Outcome, Animation, UserProgress, PowerUp, UserPowerUp, PowerUpType
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
        fields = ['id', 'title', 'story', 'image', 'order', 'intro_text']

class ScenarioSerializer(serializers.ModelSerializer):
    actions = serializers.SerializerMethodField()

    class Meta:
        model = Scenario
        fields = ['id', 'story', 'level', 'description', 'image', 'order', 'actions']
    
    def get_actions(self, obj):
        # Get all actions for this scenario
        actions = list(obj.actions.all())
        # Randomize the order
        random.shuffle(actions)
        # Serialize the shuffled actions
        return ActionSerializer(actions, many=True).data

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

class AnimationSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_type = serializers.SerializerMethodField()
    animation_type_display = serializers.CharField(source='get_animation_type_display', read_only=True)
    
    class Meta:
        model = Animation
        fields = ['id', 'story', 'animation_type', 'animation_type_display', 'title', 
                 'description', 'file_url', 'file_type', 'is_active', 'created_at']
        read_only_fields = ['created_at', 'file_type']
    
    def get_file_url(self, obj):
        if obj.gif_file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.gif_file.url)
            return obj.gif_file.url
        elif obj.mp4_file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.mp4_file.url)
            return obj.mp4_file.url
        return None
    
    def get_file_type(self, obj):
        if obj.gif_file:
            return 'gif'
        elif obj.mp4_file:
            return 'mp4'
        return None


class UserProgressSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    story_title = serializers.CharField(source='story.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = ['id', 'user', 'username', 'story', 'story_title', 'level', 'score', 'lives', 
                 'scenario_index', 'state_data', 'last_updated']
        read_only_fields = ['id', 'user', 'username', 'story_title', 'last_updated']


class PowerUpSerializer(serializers.ModelSerializer):
    story_title = serializers.CharField(source='story.title', read_only=True)
    power_up_type_display = serializers.CharField(source='get_power_up_type_display', read_only=True)
    
    class Meta:
        model = PowerUp
        fields = ['id', 'name', 'story', 'story_title', 'power_up_type', 'power_up_type_display',
                 'description', 'image', 'required_correct_answers', 'bonus_lives',
                 'score_multiplier', 'time_extension_seconds', 'is_active', 'created_at']
        read_only_fields = ['id', 'story_title', 'created_at']


class UserPowerUpSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    power_up_name = serializers.CharField(source='power_up.name', read_only=True)
    power_up_type = serializers.CharField(source='power_up.power_up_type', read_only=True)
    power_up_description = serializers.CharField(source='power_up.description', read_only=True)
    power_up_image = serializers.ImageField(source='power_up.image', read_only=True)
    
    class Meta:
        model = UserPowerUp
        fields = ['id', 'user', 'username', 'power_up', 'power_up_name', 'power_up_type',
                'power_up_description', 'power_up_image', 'game_session', 'is_active',
                'earned_at', 'used_at', 'earned_level', 'earned_scenario', 'correct_answer_count']
        read_only_fields = ['id', 'user', 'username', 'earned_at', 'power_up_name',
                           'power_up_type', 'power_up_description', 'power_up_image']