from .models import GameSettings

def game_settings(request):
    return {'game_settings': GameSettings.objects.first()}
