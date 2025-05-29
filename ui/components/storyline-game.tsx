'use client';

/**
 * This file exists as a compatibility layer.
 * It re-exports components from their correct locations to maintain backward compatibility
 * with pages that import from this path.
 */

// Re-export StorylineGame from its correct location
export { StorylineGame } from './game/StorylineGame';

// Re-export ProfileComponent from its correct location
export { ProfileComponent } from './game/ProfileComponent';
