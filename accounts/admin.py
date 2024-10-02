from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import User, UserProfile

@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    model = User
    fieldsets = DefaultUserAdmin.fieldsets + (
        (None, {'fields': ('phone',)}),
    )
    add_fieldsets = DefaultUserAdmin.add_fieldsets + (
        (None, {'fields': ('phone',)}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'last_name', 'notifications')
    search_fields = ('user__username', 'user__email')