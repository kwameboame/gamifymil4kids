from django.db import models
from .models import Story

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
        from django.core.exceptions import ValidationError
        
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
