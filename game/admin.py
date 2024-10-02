from django.contrib import admin
from .models import Story, Level, Action, LeaderboardEntry, Badge, GameSession

admin.site.register(Story)
admin.site.register(Level)
admin.site.register(Action)
admin.site.register(LeaderboardEntry)
admin.site.register(Badge)
admin.site.register(GameSession)