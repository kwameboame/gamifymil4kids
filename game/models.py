from django.db import models
from django.conf import settings

class Story(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()

    def __str__(self):
        return self.title

class Level(models.Model):
    story = models.ForeignKey(Story, related_name='levels', on_delete=models.CASCADE)
    prompt = models.TextField()
    image = models.ImageField(upload_to='level_images/', null=True, blank=True)
    order = models.IntegerField()

    def __str__(self):
        return f"{self.story.title} - Level {self.order}"

class Action(models.Model):
    level = models.ForeignKey(Level, related_name='actions', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    points = models.IntegerField(default=0)

    def __str__(self):
        return self.text

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
