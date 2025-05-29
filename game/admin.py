from django.contrib import admin
from .models import (Story, Scenario, Level, Action, LeaderboardEntry, Badge, 
                    GameSession, GameInvite, Outcome, Animation, AnimationType)


# Inline for Outcome within Action
class OutcomeInline(admin.TabularInline):
    model = Outcome
    extra = 1
    max_num = 1  # Only allow one outcome per action

# Inline for Action within Scenario
class ActionInline(admin.TabularInline):
    model = Action
    extra = 1
    show_change_link = True  # Adds a link to edit the action in detail

# Inline for Scenario within Level
class ScenarioInline(admin.TabularInline):
    model = Scenario
    extra = 1
    show_change_link = True

# Inline for Level within Story
class LevelInline(admin.TabularInline):
    model = Level
    extra = 1
    show_change_link = True

# Admin class for Story
@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    inlines = [LevelInline]
    list_display = ('title',)
    search_fields = ('title', 'description')

# Admin class for Level
@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('title', 'story', 'order')
    list_filter = ('story',)
    inlines = [ScenarioInline]
    search_fields = ('title', 'story__title')

# Admin class for Scenario
@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('story', 'level', 'order')
    list_filter = ('story', 'level')
    inlines = [ActionInline]
    search_fields = ('description', 'story__title', 'level__title')

# Admin class for Action
@admin.register(Action)
class ActionAdmin(admin.ModelAdmin):
    list_display = ('text', 'scenario', 'is_correct', 'points', 'has_outcome')
    list_filter = ('is_correct', 'scenario__story', 'scenario__level')
    inlines = [OutcomeInline]
    search_fields = ('text', 'scenario__description')

    def has_outcome(self, obj):
        return hasattr(obj, 'outcome') and obj.outcome is not None
    has_outcome.boolean = True
    has_outcome.short_description = 'Has Outcome'

# Admin class for Outcome
@admin.register(Outcome)
class OutcomeAdmin(admin.ModelAdmin):
    list_display = ('get_action_text', 'text', 'created_at')
    search_fields = ('text', 'action__text')
    
    def get_action_text(self, obj):
        return obj.action.text if obj.action else 'No Action'
    get_action_text.short_description = 'Action'
    get_action_text.admin_order_field = 'action__text'

# Admin class for Animation
@admin.register(Animation)
class AnimationAdmin(admin.ModelAdmin):
    list_display = ('title', 'story', 'animation_type', 'file_type', 'is_active', 'created_at')
    list_filter = ('animation_type', 'story', 'is_active')
    search_fields = ('title', 'description', 'story__title')
    readonly_fields = ('created_at', 'updated_at', 'file_type')
    fieldsets = (
        (None, {
            'fields': ('story', 'animation_type', 'title', 'description', 'is_active')
        }),
        ('Animation Files', {
            'fields': ('gif_file', 'mp4_file')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

admin.site.register(LeaderboardEntry)
admin.site.register(Badge)
admin.site.register(GameSession)
admin.site.register(GameInvite)