from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Animation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('animation_type', models.CharField(choices=[('correct', 'Correct Action'), ('partial', 'Partially Correct Action'), ('incorrect', 'Incorrect Action'), ('gameover', 'Game Over'), ('levelcomplete', 'Level Complete'), ('gamecomplete', 'Game Complete')], default='correct', max_length=20)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('gif_file', models.FileField(blank=True, help_text='Upload a GIF animation', null=True, upload_to='animations/gifs/')),
                ('mp4_file', models.FileField(blank=True, help_text='Upload an MP4 video', null=True, upload_to='animations/mp4/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('story', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='animations', to='game.story')),
            ],
            options={
                'verbose_name': 'Animation',
                'verbose_name_plural': 'Animations',
                'unique_together': {('story', 'animation_type')},
            },
        ),
    ]
