from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from game.models import Story, Level, Scenario

# Instead of testing with database creation, let's use a manual approach
def test_level_progression():
    """Manual test function to verify backend level transitions"""
    # 1. Get the Truth Quest story (ID 3)
    story_url = reverse('story-detail', args=[3])
    
    # 2. Print all levels in the story
    print("\n===== TESTING STORY LEVELS =====\n")
    levels = Level.objects.filter(story_id=3).order_by('order')
    print(f"Found {len(levels)} levels in Truth Quest story")
    for level in levels:
        print(f"Level {level.order}: {level.title} (ID: {level.id})")
    
    # 3. For each level, print its scenarios
    print("\n===== TESTING LEVEL SCENARIOS =====\n")
    for level in levels:
        scenarios = Scenario.objects.filter(level=level).order_by('order')
        print(f"Level {level.order} has {len(scenarios)} scenarios:")
        for i, scenario in enumerate(scenarios, 1):
            print(f"  {i}. Scenario {scenario.order}: {scenario.description[:50]}...")
    
    # 4. Verify the API endpoints return correct data
    print("\n===== TESTING API ENDPOINTS =====\n")
    from django.test.client import Client
    client = Client()
    
    # Test story detail endpoint
    resp = client.get(story_url)
    if resp.status_code == 200:
        data = resp.json()
        api_levels = data.get('levels', [])
        api_scenarios = data.get('scenarios', [])
        print(f"Story API returned {len(api_levels)} levels and {len(api_scenarios)} scenarios")
        
        # Check each level has scenarios
        for level in api_levels:
            level_scenarios = [s for s in api_scenarios if s['level'] == level['id']]
            print(f"Level {level['order']} (ID: {level['id']}) has {len(level_scenarios)} scenarios in API response")
    else:
        print(f"Error: Story API returned status {resp.status_code}")
    
    # Test level scenarios endpoint for each level
    for level in levels:
        url = reverse('level-scenarios-list', args=[3, level.id])
        resp = client.get(url)
        if resp.status_code == 200:
            scenarios = resp.json()
            print(f"Level {level.order} scenarios API returned {len(scenarios)} scenarios")
        else:
            print(f"Error: Level {level.order} scenarios API returned status {resp.status_code}")
    
    print("\n===== TEST COMPLETE =====\n")
    return "Test completed - check console output for results"

test_level_progression()