import axios from 'axios';
import { PowerUp } from '@/components/game/PowerUpModal';

// Extended PowerUp interface with backend fields
interface BackendPowerUp extends PowerUp {
  required_correct_answers: number;
  user_power_up_id?: number;
}

// Base URL without /api since it's already in NEXT_PUBLIC_BACKEND_URL
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';

class PowerUpService {
  // Get all power-ups for a story
  async getPowerUpsForStory(storyId: number, token: string) {
    try {
      // Using the correct endpoint format with /game/ prefix
      console.log(`[DEBUG] Fetching power-ups for story ${storyId} from ${API_URL}/game/power-ups/by-story/${storyId}/`);
      const response = await axios.get(`${API_URL}/game/power-ups/by-story/${storyId}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching power-ups:', error);
      // Log additional details if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {response?: {data?: unknown, status?: number}};
        console.error('Error response status:', axiosError.response?.status);
      }
      throw error;
    }
  }

  // Get user's active power-ups
  async getUserActivePowerUps(token: string, storyId?: number): Promise<PowerUp[]> {
    try {
      const url = storyId 
        ? `${API_URL}/game/user-power-ups/active/?story_id=${storyId}` 
        : `${API_URL}/game/user-power-ups/active/`;
      
      console.log(`[DEBUG] Fetching active power-ups from ${url}`);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data as PowerUp[];
    } catch (error) {
      console.error('Error fetching user power-ups:', error);
      // Log additional details if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {response?: {data?: unknown, status?: number}};
        console.error('Error response status:', axiosError.response?.status);
      }
      throw error;
    }
  }

  // Earn a new power-up
  async earnPowerUp(token: string, data: {
    story_id: number;
    power_up_id: number;
    correct_answer_count: number;
    level?: number;
    scenario?: number;
    game_session_id?: number;
  }): Promise<{id: number, power_up: number, user: number}> {
    try {
      console.log(`[DEBUG] Earning power-up for story ${data.story_id} with ${data.correct_answer_count} correct answers`);
      const response = await axios.post(
        `${API_URL}/game/user-power-ups/earn/`, 
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data as {id: number, power_up: number, user: number};
    } catch (error) {
      console.error('Error earning power-up:', error);
      // Log additional details if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {response?: {data?: unknown, status?: number}};
        console.error('Error response status:', axiosError.response?.status);
      }
      throw error;
    }
  }

  // Apply a power-up
  async applyPowerUp(token: string, userPowerUpId: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`[DEBUG] Using power-up with ID ${userPowerUpId}`);
      const response = await axios.post(
        `${API_URL}/game/user-power-ups/${userPowerUpId}/use/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error using power-up:', error);
      // Log additional details if it's an axios error
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {response?: {data?: unknown, status?: number}};
        console.error('Error response status:', axiosError.response?.status);
      }
      throw error;
    }
  }

  // Check if user can earn a power-up based on correct answers
  async checkEarnPowerUp(
    token: string, 
    storyId: number, 
    correctAnswerCount: number
  ): Promise<PowerUp | null> {
    try {
      // Validate inputs
      if (!token) {
        console.error('[ERROR] Missing authentication token');
        return null;
      }
      
      if (!storyId || isNaN(storyId)) {
        console.error('[ERROR] Invalid story ID:', storyId);
        return null;
      }
      
      // Log the token format (first few chars) for debugging
      console.log('[DEBUG] Token format check:', token.substring(0, 10) + '...');
      console.log('[DEBUG] Getting power-ups for story:', storyId);
      
      // First get all powerups for this story
      const powerUps = await this.getPowerUpsForStory(storyId, token) as BackendPowerUp[];
      console.log('[DEBUG] Available power-ups:', powerUps?.length || 0);
      
      if (!powerUps || powerUps.length === 0) {
        console.log('[DEBUG] No power-ups found for this story');
        return null;
      }
      
      // Filter all eligible power-ups where user has at least the required number of correct answers
      const eligiblePowerUps = powerUps.filter(
        (p) => correctAnswerCount >= p.required_correct_answers
      );
      
      console.log('[DEBUG] Eligible power-ups found:', eligiblePowerUps.length);
      
      // If there are multiple eligible power-ups, select the one with the closest match to the current answer count
      // This ensures we get the most appropriate power-up for the player's current progress
      let bestMatchPowerUp: BackendPowerUp | null = null;
      
      if (eligiblePowerUps.length > 0) {
        // Find the power-up with the highest required_correct_answers that's still eligible
        // This gets the most appropriate power-up for the current progress
        bestMatchPowerUp = eligiblePowerUps.reduce((best, current) => {
          if (!best) return current;
          return current.required_correct_answers > best.required_correct_answers ? current : best;
        }, null as BackendPowerUp | null);
      }
      
      console.log('[DEBUG] Best matching power-up found:', bestMatchPowerUp ? bestMatchPowerUp.name : 'None');
      
      if (bestMatchPowerUp) {
        console.log('[DEBUG] Attempting to earn power-up:', bestMatchPowerUp.id);
        // If eligible, earn the powerup
        const earnedPowerUp = await this.earnPowerUp(token, {
          story_id: storyId,
          power_up_id: bestMatchPowerUp.id,
          correct_answer_count: correctAnswerCount
        });
        
        console.log('[DEBUG] Successfully earned power-up with ID:', earnedPowerUp?.id);
        
        // Return the power-up with additional details from the earned response
        return {
          ...bestMatchPowerUp,
          user_power_up_id: earnedPowerUp.id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for power-up:', error);
      // Use type assertion to handle axios error properties
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {response?: {data?: unknown, status?: number}};
        console.error('Error response data:', axiosError.response?.data);
        console.error('Error response status:', axiosError.response?.status);
      }
      return null;
    }
  }
}

const powerUpService = new PowerUpService();
export default powerUpService;
