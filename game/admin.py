from django.contrib import admin
from .models import Story, Level, Action, LeaderboardEntry, Badge

class ActionInline(admin.TabularInline):
    model = Action
    extra = 3

class LevelInline(admin.StackedInline):
    model = Level
    extra = 1
    show_change_link = True

@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'description')
    inlines = [LevelInline]

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('story', 'prompt', 'order')
    list_filter = ('story',)
    inlines = [ActionInline]

@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ('level', 'text', 'is_correct', 'points')
    list_filter = ('level', 'is_correct')

@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'story', 'created_at')
    list_filter = ('story', 'created_at')
    search_fields = ('user__username',)

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

