/**
 * Feature layer for critical gameplay flows
 * 
 * This layer provides use-case functions that orchestrate:
 * - Repository access
 * - Rule evaluation
 * - Navigation decisions
 * 
 * Pages should call these functions instead of directly mixing repositories,
 * rule translation, and navigation logic.
 */

// Re-export feature modules
export * from './capital';
export * from './daily-orders';
export * from './province-actions';
export * from './siege-resolution';
