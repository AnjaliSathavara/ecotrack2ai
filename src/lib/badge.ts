/**
 * Details of the sustainability badge earned by the user.
 */
export type BadgeLevel = {
  /** The name of the badge (e.g., "Eco Champion") */
  name: string;
  /** The numerical badge tier (1 to 5) */
  tier: 1 | 2 | 3 | 4 | 5;
  /** Tailwind text color class name for styling the badge display */
  color: string;
  /** A short description of the user's sustainability progress */
  description: string;
};

/**
 * Determines the sustainability badge tier and details based on the user's carbon footprint score.
 * Scores are 0-100, where 100 represents the lowest impact.
 *
 * @param {number} score - The calculated carbon footprint score (0 to 100).
 * @returns {BadgeLevel} The calculated badge tier, name, color styling, and description.
 */
export function badgeForScore(score: number): BadgeLevel {
  if (score >= 85)
    return {
      name: "Eco Champion",
      tier: 5,
      color: "text-leaf",
      description: "Top-tier sustainability impact.",
    };
  if (score >= 70)
    return {
      name: "Eco Leader",
      tier: 4,
      color: "text-leaf",
      description: "Excellent low-carbon lifestyle.",
    };
  if (score >= 55)
    return {
      name: "Green Advocate",
      tier: 3,
      color: "text-ocean",
      description: "Good progress, keep going.",
    };
  if (score >= 40)
    return {
      name: "Eco Aware",
      tier: 2,
      color: "text-sun",
      description: "On the path to lower impact.",
    };
  return {
    name: "Getting Started",
    tier: 1,
    color: "text-muted-foreground",
    description: "Take your first steps.",
  };
}
