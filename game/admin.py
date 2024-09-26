from django.contrib import admin
from .models import Story, Level, Action, LeaderboardEntry, Badge, UserProfile

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
    list_display = ('level', 'text', 'is_correct')
    list_filter = ('level', 'is_correct')

@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ('name', 'score', 'story', 'created_at')
    list_filter = ('story', 'created_at')
    search_fields = ('name',)

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('high_scores',)
        return self.readonly_fields