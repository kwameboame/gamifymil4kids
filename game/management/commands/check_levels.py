from django.core.management.base import BaseCommand
from game.models import Story, Level, Scenario

class Command(BaseCommand):
    help = 'Checks level transition data in the database'

    def handle(self, *args, **options):
        # Check Truth Quest story (ID 3)
        try:
            story = Story.objects.get(id=3)
            self.stdout.write(f"Found story: {story.title} (ID: {story.id})")
            
            # Get all levels
            levels = Level.objects.filter(story=story).order_by('order')
            self.stdout.write(f"Found {levels.count()} levels:")
            
            for level in levels:
                self.stdout.write(f"  Level {level.order}: {level.title} (ID: {level.id})")
                
                # Get scenarios for this level
                scenarios = Scenario.objects.filter(level=level).order_by('order')
                self.stdout.write(f"    Has {scenarios.count()} scenarios:")
                
                for scenario in scenarios:
                    self.stdout.write(f"      Scenario {scenario.order}: {scenario.description[:40]}... (ID: {scenario.id})")
            
            self.stdout.write(self.style.SUCCESS("Data check complete"))
            
        except Story.DoesNotExist:
            self.stdout.write(self.style.ERROR("Story with ID 3 not found"))
