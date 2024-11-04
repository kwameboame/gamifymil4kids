from django.contrib import admin
from .models import Story, Scenario, Level, Action, LeaderboardEntry, Badge, GameSession, GameInvite


# Inline for Action within Scenario
class ActionInline(admin.TabularInline):  # You can also use StackedInline for a different layout
    model = Action
    extra = 1  # Number of empty forms to display by default

# Inline for Scenario within Level
class ScenarioInline(admin.TabularInline):
    model = Scenario
    extra = 1

# Inline for Level within Story
class LevelInline(admin.TabularInline):
    model = Level
    extra = 1

# Admin class for Story
@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    inlines = [LevelInline]  # Add Level inline in Story admin

# Admin class for Level
@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('title', 'story', 'order')
    inlines = [ScenarioInline]  # Add Scenario inline in Level admin

# Admin class for Scenario
@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('story', 'level', 'order')
    inlines = [ActionInline]  # Add Action inline in Scenario admin

# Admin class for Action
@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ('scenario', 'text', 'is_correct', 'points')


# admin.site.register(Story)
# admin.site.register(Level)
# admin.site.register(Action)
admin.site.register(LeaderboardEntry)
admin.site.register(Badge)
admin.site.register(GameSession)
admin.site.register(GameInvite)