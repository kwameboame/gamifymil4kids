# Generated by Django 5.1.1 on 2024-09-30 14:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='action',
            name='points',
            field=models.IntegerField(default=0),
        ),
    ]