from django.shortcuts import render
from .models import GameSettings

def game_view(request):
    game_settings = GameSettings.objects.first()
    print(game_settings)
    if game_settings is None:
        # Handle the case where no settings exist, maybe create default settings
        game_settings = GameSettings.objects.create()
    return render(request, 'base.html', {'game_settings': game_settings})
