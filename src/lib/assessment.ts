export type AssessmentData = {
  transportation: number; // km/week by car
  publicTransit: number; // km/week
  flights: number; // short-haul flights / year
  electricity: number; // kWh / month
  renewableShare: number; // 0-100 %
  diet: "vegan" | "vegetarian" | "omnivore" | "heavy-meat";
  localFood: number; // 0-100 %
  shoppingFrequency: "low" | "medium" | "high" | "very-high";
  fastFashion: boolean;
  recyclingRate: number; // 0-100 %
  compost: boolean;
  travelHabits: "rare" | "annual" | "frequent" | "very-frequent";
  updatedAt?: string;
};

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

export function saveAssessment(d: AssessmentData) {
  localStorage.setItem(KEY, JSON.stringify({ ...d, updatedAt: new Date().toISOString() }));
}

// Annual tonnes CO2e (rough but reasonable factors)
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
    score >= 85 ? "Champion" :
    score >= 70 ? "Excellent" :
    score >= 55 ? "Good" :
    score >= 40 ? "Fair" :
    score >= 25 ? "Needs Work" : "High Impact";
  const ratingColor =
    score >= 70 ? "text-leaf" : score >= 40 ? "text-sun" : "text-destructive";

  return { breakdown, totalKg, totalTonnes, score, rating, ratingColor };
}

export type Footprint = ReturnType<typeof computeFootprint>;
