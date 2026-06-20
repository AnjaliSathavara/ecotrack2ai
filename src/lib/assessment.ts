/**
 * Structure of the carbon footprint assessment questionnaire answers.
 */
export type AssessmentData = {
  /** Average distance traveled by car (in km per week) */
  transportation: number;
  /** Average distance traveled via public transit (in km per week) */
  publicTransit: number;
  /** Number of short-haul flights taken annually */
  flights: number;
  /** Average monthly electricity consumption (in kWh) */
  electricity: number;
  /** Share of consumed electricity sourced from renewable sources (0 to 100) */
  renewableShare: number;
  /** General dietary category */
  diet: "vegan" | "vegetarian" | "omnivore" | "heavy-meat";
  /** Percentage of food sourced locally or regionally (0 to 100) */
  localFood: number;
  /** General non-food consumer goods shopping frequency */
  shoppingFrequency: "low" | "medium" | "high" | "very-high";
  /** Flag indicating high volume/consumption of fast fashion brands */
  fastFashion: boolean;
  /** Percentage of recyclable household waste diverted from landfills (0 to 100) */
  recyclingRate: number;
  /** Flag indicating participation in composting organic waste */
  compost: boolean;
  /** Overall travel and tourism habits/frequency */
  travelHabits: "rare" | "annual" | "frequent" | "very-frequent";
  /** Optional ISO timestamp of the last assessment update */
  updatedAt?: string;
};

/**
 * Default assessment answers used to populate a new profile's carbon footprint form.
 */
export const DEFAULT_ASSESSMENT: AssessmentData = {
  transportation: 120,
  publicTransit: 30,
  flights: 2,
  electricity: 300,
  renewableShare: 20,
  diet: "omnivore",
  localFood: 40,
  shoppingFrequency: "medium",
  fastFashion: false,
  recyclingRate: 60,
  compost: false,
  travelHabits: "annual",
};

const KEY = "ecotrack-assessment";

/**
 * Loads the user's latest carbon footprint assessment data from browser localStorage.
 * Returns null if window is undefined (e.g., during Server-Side Rendering) or if no assessment exists.
 *
 * @returns {AssessmentData | null} The saved assessment data or null if not found.
 */
export function loadAssessment(): AssessmentData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentData;
  } catch {
    return null;
  }
}

/**
 * Saves the user's carbon footprint assessment data to localStorage, injecting an updatedAt timestamp.
 *
 * @param {AssessmentData} d - The user's assessment data to save.
 * @returns {void}
 */
export function saveAssessment(d: AssessmentData): void {
  localStorage.setItem(KEY, JSON.stringify({ ...d, updatedAt: new Date().toISOString() }));
}

/**
 * Computes the estimated annual carbon footprint based on the provided assessment habits.
 * Factors in transportation, flights, electricity (with renewable share offset), diet (sourcing offsets),
 * shopping habits, fast-fashion choices, recycling/composting rates, and general travel habits.
 *
 * @param {AssessmentData} d - The assessment data.
 * @returns {object} Calculated footprint results including category breakdowns, total kg, total tonnes, score (0-100), and rating description.
 */
export function computeFootprint(d: AssessmentData) {
  const car = d.transportation * 52 * 0.18; // kg
  const transit = d.publicTransit * 52 * 0.05;
  const flights = d.flights * 250; // short-haul ~250 kg
  const elec = d.electricity * 12 * 0.4 * (1 - d.renewableShare / 100);
  const dietMap = { vegan: 1.5, vegetarian: 1.9, omnivore: 2.5, "heavy-meat": 3.8 };
  const diet = dietMap[d.diet] * 1000 * (1 - d.localFood / 100 / 4);
  const shopMap = { low: 400, medium: 900, high: 1600, "very-high": 2400 };
  const shop = shopMap[d.shoppingFrequency] * (d.fastFashion ? 1.4 : 1);
  const waste = 400 * (1 - d.recyclingRate / 100) * (d.compost ? 0.7 : 1);
  const travelMap = { rare: 100, annual: 600, frequent: 1500, "very-frequent": 3000 };
  const travel = travelMap[d.travelHabits];

  const breakdown = {
    Transportation: Math.round(car + transit),
    Flights: Math.round(flights),
    Electricity: Math.round(elec),
    Food: Math.round(diet),
    Shopping: Math.round(shop),
    Waste: Math.round(waste),
    Travel: Math.round(travel),
  };
  const totalKg = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const totalTonnes = +(totalKg / 1000).toFixed(2);

  // Score: 100 great, 0 very high. Global avg ~4.7 t, target 2 t.
  const score = Math.max(0, Math.min(100, Math.round(100 - (totalTonnes - 1.5) * 12)));
  const rating =
    score >= 85
      ? "Champion"
      : score >= 70
        ? "Excellent"
        : score >= 55
          ? "Good"
          : score >= 40
            ? "Fair"
            : score >= 25
              ? "Needs Work"
              : "High Impact";
  const ratingColor = score >= 70 ? "text-leaf" : score >= 40 ? "text-sun" : "text-destructive";

  return { breakdown, totalKg, totalTonnes, score, rating, ratingColor };
}

export type Footprint = ReturnType<typeof computeFootprint>;
