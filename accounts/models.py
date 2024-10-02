import datetime
from datetime import date
from django.contrib.auth.models import AbstractUser, UserManager, Group, Permission, User as CoreUser
from django.core.validators import RegexValidator
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

from sorl.thumbnail import ImageField
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill

CoreUser._meta.get_field('email')._unique = True

# from rest_framework.authtoken.models import Token

from django.db import models
from game.models import Badge  # Ensure this import is correct based on your project structure


# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(
        'Phone',
        validators=[phone_regex],
        max_length=17,
        unique=True,
        null=True,
        blank=True
    )
    
    # Remove 'username' from REQUIRED_FIELDS
    REQUIRED_FIELDS = ['email', 'phone']

    objects = UserManager()

    # Add related_name to avoid clashes
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="accounts_user_set",
        related_query_name="accounts_user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="accounts_user_set",
        related_query_name="accounts_user",
    )


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    notifications = models.BooleanField(default=True)
    entry_thumbnail = ImageField(null=True, blank=True, upload_to='profile_photos')
    image_thumbnail = ImageSpecField(
        source='entry_thumbnail',
        processors=[ResizeToFill(160, 160)],
        format='JPEG',
        options={'quality': 60}
    )
    post_thumb = ImageSpecField(
        source='entry_thumbnail',
        processors=[ResizeToFill(200, 200)],
        format='JPEG',
        options={'quality': 60}
    )
    high_scores = models.JSONField(default=dict)
    badges = models.ManyToManyField(Badge, blank=True, related_name="user_badges")  # Corrected 'user_adges' to 'user_badges'

    def __str__(self):  # __unicode__ for Python 2
        return self.user.username

    @receiver(post_save, sender=User)
    def create_or_update_user_profile(sender, instance, created, **kwargs):
        if created:
            UserProfile.objects.create(user=instance, name=instance.username)
        instance.profile.save()


# Remove the PhoneOTP model as it's not needed for this implementation