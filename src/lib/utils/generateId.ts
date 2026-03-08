/**
 * Generates a unique element ID combining a timestamp and random suffix
 * to avoid collisions even with rapid creation.
 */
export function generateId(prefix = 'el'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
