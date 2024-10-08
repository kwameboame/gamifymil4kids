# Generated by Django 5.1.1 on 2024-10-01 18:45

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_initial'),
        ('game', '0004_delete_userprofile'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='phone_regex',
        ),
        migrations.AlterField(
            model_name='user',
            name='phone',
            field=models.CharField(blank=True, max_length=17, null=True, unique=True, validators=[django.core.validators.RegexValidator(message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.", regex='^\\+?1?\\d{9,15}$')], verbose_name='Phone'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='badges',
            field=models.ManyToManyField(blank=True, related_name='user_badges', to='game.badge'),
        ),
    ]
