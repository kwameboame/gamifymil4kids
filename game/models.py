from django.db import models

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
        return self.prompt

class Action(models.Model):
    level = models.ForeignKey(Level, related_name='actions', on_delete=models.CASCADE)
    text = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class LeaderboardEntry(models.Model):
    name = models.CharField(max_length=100)
    score = models.IntegerField()
    story = models.ForeignKey(Story, related_name='leaderboard_entries', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Badge(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='badge_images/', null=True, blank=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    high_scores = models.JSONField(default=dict)
    badges = models.ManyToManyField(Badge, blank=True)

    def __str__(self):
        return self.name
