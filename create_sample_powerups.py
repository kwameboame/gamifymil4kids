import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "truthquest.settings")
django.setup()

from game.models import Story, PowerUp, PowerUpType
from django.core.files.images import ImageFile
from django.conf import settings
import os

def create_sample_powerups():
    """
    Create sample powerups for the Truth Quest game
    """
    # Find the Truth Quest story
    try:
        truth_quest = Story.objects.get(title="Truth Quest")
        print(f"Found Truth Quest story with ID: {truth_quest.id}")
    except Story.DoesNotExist:
        print("Truth Quest story not found. Please make sure it exists first.")
        return
    
    # Sample powerups for Truth Quest
    powerups = [
        {
            "name": "Extra Life",
            "power_up_type": PowerUpType.EXTRA_LIFE,
            "description": "Earn an extra life to continue your journey when you make a mistake.",
            "required_correct_answers": 5,
            "bonus_lives": 1,
            "score_multiplier": 1.0,
            "time_extension_seconds": 0,
            "image_path": "powerup_images/extra_life.png"  # Default placeholder
        },
        {
            "name": "Score Booster",
            "power_up_type": PowerUpType.SCORE_BOOST,
            "description": "Double your points for the next correct answer!",
            "required_correct_answers": 7,
            "bonus_lives": 0,
            "score_multiplier": 2.0,
            "time_extension_seconds": 0,
            "image_path": "powerup_images/score_boost.png"  # Default placeholder
        },
        {
            "name": "Time Extension",
            "power_up_type": PowerUpType.TIME_EXTENSION,
            "description": "Add 30 seconds to your timer. Use wisely!",
            "required_correct_answers": 8,
            "bonus_lives": 0,
            "score_multiplier": 1.0,
            "time_extension_seconds": 30,
            "image_path": "powerup_images/time_extension.png"  # Default placeholder
        },
        {
            "name": "Hint",
            "power_up_type": PowerUpType.HINT,
            "description": "Get a helpful hint for a challenging question.",
            "required_correct_answers": 6,
            "bonus_lives": 0,
            "score_multiplier": 1.0,
            "time_extension_seconds": 0,
            "image_path": "powerup_images/hint.png"  # Default placeholder
        }
    ]
    
    # Create each powerup
    for powerup_data in powerups:
        image_path = powerup_data.pop("image_path")
        
        # Check if powerup already exists
        existing = PowerUp.objects.filter(
            name=powerup_data["name"],
            story=truth_quest
        ).first()
        
        if existing:
            print(f"Powerup '{powerup_data['name']}' already exists, updating...")
            for key, value in powerup_data.items():
                setattr(existing, key, value)
            existing.story = truth_quest
            existing.save()
            powerup = existing
        else:
            # Create new powerup
            powerup = PowerUp.objects.create(
                story=truth_quest,
                **powerup_data
            )
            print(f"Created new powerup: {powerup.name}")
        
        # Try to set image if file exists
        try:
            media_root = settings.MEDIA_ROOT
            image_full_path = os.path.join(media_root, image_path)
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(image_full_path), exist_ok=True)
            
            # For demonstration, we won't actually set image files
            # as they don't exist, but in production you'd do:
            # with open(image_full_path, 'rb') as img:
            #     powerup.image.save(os.path.basename(image_path), ImageFile(img), save=True)
            
            print(f"Image would be loaded from: {image_full_path}")
            
        except Exception as e:
            print(f"Could not set image for {powerup.name}: {e}")

if __name__ == "__main__":
    create_sample_powerups()
    print("Sample powerups created for Truth Quest!")
