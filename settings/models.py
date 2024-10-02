from django.db import models

class GameSettings(models.Model):
    background_music = models.FileField(upload_to='game_music/')
    background_image = models.ImageField(upload_to='game_backgrounds/', null=True, blank=True)

    class Meta:
        verbose_name = 'Game Settings'
        verbose_name_plural = 'Game Settings'
    
    def __str__(self):
        return "Game Settings"
