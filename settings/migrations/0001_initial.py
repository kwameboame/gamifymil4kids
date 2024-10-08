# Generated by Django 5.1 on 2024-08-07 17:10

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('background_music', models.FileField(upload_to='game_music/')),
            ],
            options={
                'verbose_name': 'Game Settings',
                'verbose_name_plural': 'Game Settings',
            },
        ),
    ]
