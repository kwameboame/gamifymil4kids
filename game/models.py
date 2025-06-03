from django.db import models
from django.conf import settings
import uuid
from datetime import timedelta
from django.utils import timezone
from django.core.exceptions import ValidationError

def get_expiry():
    return timezone.now() + timedelta(days=7)

class Story(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='level_images/', null=True, blank=True)

    def __str__(self):
        return self.title


class Level(models.Model):
    title = models.CharField(null=True, blank=True, max_length=200)
    story = models.ForeignKey(Story, related_name='levels', on_delete=models.CASCADE)
    intro_text = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='level_images/', null=True, blank=True)
    order = models.IntegerField()

    def __str__(self):
        return f"{self.story.title} - Level {self.order}"


class Scenario(models.Model):
    story = models.ForeignKey(Story, related_name='story', on_delete=models.CASCADE)
    level = models.ForeignKey(Level, related_name='levels', on_delete=models.CASCADE)
    description = models.TextField()
    image = models.ImageField(upload_to='level_images/', null=True, blank=True)
    order = models.IntegerField()

    def __str__(self):
        return f"{self.story.title} - Scenario {self.order}"


class Action(models.Model):
    scenario = models.ForeignKey(Scenario, related_name='actions', null=True, blank=True, on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    points = models.IntegerField(default=0)

    def __str__(self):
        return self.text


class Outcome(models.Model):
    action = models.OneToOneField(Action, on_delete=models.CASCADE, related_name='outcome', null=True, blank=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Outcome for {self.action.text if self.action else 'Unknown Action'}"


class LeaderboardEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, related_name='leaderboard_entries', on_delete=models.CASCADE)
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'story')

    def __str__(self):
        return f"{self.user.username} - {self.story.title}"

class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='badge_images/', null=True, blank=True)

    def __str__(self):
        return self.name

class GameSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.story.title} - {self.start_time}"


class UserProgress(models.Model):
    """Model to store detailed game progress for users."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='game_progress')
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    level = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    lives = models.IntegerField(default=3)
    scenario_index = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    # Additional state info stored as JSON
    state_data = models.JSONField(default=dict, blank=True)
    
    class Meta:
        unique_together = ('user', 'story')
        verbose_name = 'User Progress'
        verbose_name_plural = 'User Progress'
    
    def __str__(self):
        return f"{self.user.username} - {self.story.title} - Level {self.level}"

class GameInvite(models.Model):
    inviter = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_invites', on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_expiry)  # Correctly using get_expiry
    
    def __str__(self):
        return f"Invite from {self.inviter.username} for story {self.story.title}"
    
    def is_expired(self):
        return timezone.now() > self.expires_at


class AnimationType(models.TextChoices):
    CORRECT_ACTION = 'correct', 'Correct Action'
    PARTIALLY_CORRECT = 'partial', 'Partially Correct Action'
    INCORRECT_ACTION = 'incorrect', 'Incorrect Action'
    GAME_OVER = 'gameover', 'Game Over'
    LEVEL_COMPLETE = 'levelcomplete', 'Level Complete'
    GAME_COMPLETE = 'gamecomplete', 'Game Complete'


class Animation(models.Model):
    """
    Model to store animations for different game events.
    Each animation is associated with a specific story and event type.
    """
    story = models.ForeignKey(Story, related_name='animations', on_delete=models.CASCADE)
    animation_type = models.CharField(
        max_length=20,
        choices=AnimationType.choices,
        default=AnimationType.CORRECT_ACTION
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    # Allow either a GIF or MP4 file, but not both
    gif_file = models.FileField(
        upload_to='animations/gifs/', 
        blank=True, 
        null=True,
        help_text='Upload a GIF animation'
    )
    mp4_file = models.FileField(
        upload_to='animations/mp4/', 
        blank=True, 
        null=True,
        help_text='Upload an MP4 video'
    )
    
    # Track when the animation was added and last updated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Control whether this animation is active
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('story', 'animation_type')
        verbose_name = 'Animation'
        verbose_name_plural = 'Animations'
    
    def __str__(self):
        return f"{self.get_animation_type_display()} for {self.story.title}"
    
    def clean(self):
        """Ensure that either gif_file or mp4_file is provided, but not both."""
        if not self.gif_file and not self.mp4_file:
            raise ValidationError("You must provide either a GIF or MP4 file.")
        
        if self.gif_file and self.mp4_file:
            raise ValidationError("You can only provide either a GIF or MP4 file, not both.")
    
    @property
    def file_url(self):
        """Return the URL of the animation file (either GIF or MP4)."""
        if self.gif_file:
            return self.gif_file.url
        return self.mp4_file.url
    
    @property
    def file_type(self):
        """Return the type of file ('gif' or 'mp4')."""
        if self.gif_file:
            return 'gif'
        return 'mp4'


class PowerUpType(models.TextChoices):
    EXTRA_LIFE = 'extra_life', 'Extra Life'
    SCORE_BOOST = 'score_boost', 'Score Boost'
    TIME_EXTENSION = 'time_extension', 'Time Extension'
    HINT = 'hint', 'Hint'


class PowerUp(models.Model):
    """
    Model to represent different types of power-ups in the game.
    Each power-up can be associated with a specific story and has different effects.
    """
    name = models.CharField(max_length=100)
    story = models.ForeignKey(Story, related_name='power_ups', on_delete=models.CASCADE)
    power_up_type = models.CharField(
        max_length=20,
        choices=PowerUpType.choices,
        default=PowerUpType.EXTRA_LIFE
    )
    description = models.TextField()
    image = models.ImageField(upload_to='powerup_images/', null=True, blank=True)
    
    # Conditions to earn the power-up
    required_correct_answers = models.IntegerField(default=5, 
        help_text='Number of correct answers needed to earn this power-up')
    
    # Effects of the power-up
    bonus_lives = models.IntegerField(default=0,
        help_text='Number of extra lives this power-up grants')
    score_multiplier = models.FloatField(default=1.0, 
        help_text='Multiplier for score (e.g., 2.0 doubles the score)')
    time_extension_seconds = models.IntegerField(default=0,
        help_text='Additional time in seconds this power-up grants')
    
    # Control whether this power-up is active
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Power-up'
        verbose_name_plural = 'Power-ups'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} for {self.story.title}"


class UserPowerUp(models.Model):
    """
    Model to track which power-ups a user has earned or used.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='power_ups', on_delete=models.CASCADE)
    power_up = models.ForeignKey(PowerUp, related_name='user_power_ups', on_delete=models.CASCADE)
    game_session = models.ForeignKey(GameSession, related_name='power_ups', null=True, blank=True, on_delete=models.CASCADE)
    
    is_active = models.BooleanField(default=True, 
        help_text='Whether the power-up is currently active (false if used)')
    earned_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    
    # Track the context in which this power-up was earned (level, scenario)
    earned_level = models.IntegerField(default=0)
    earned_scenario = models.IntegerField(default=0)
    correct_answer_count = models.IntegerField(default=0, 
        help_text='How many correct answers the user had when earning this')
    
    class Meta:
        verbose_name = 'User Power-up'
        verbose_name_plural = 'User Power-ups'
        ordering = ['-earned_at']
    
    def __str__(self):
        status = "Active" if self.is_active else "Used"
        return f"{self.user.username} - {self.power_up.name} ({status})"
    
    def use(self):
        """
        Mark this power-up as used and apply its effects.
        """
        self.is_active = False
        self.used_at = timezone.now()
        self.save()
        return True