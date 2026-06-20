import { describe, it, expect } from "vitest";
import { computeFootprint, DEFAULT_ASSESSMENT, type AssessmentData } from "./assessment";
import { badgeForScore } from "./badge";

describe("assessment calculations", () => {
  it("should calculate footprint correctly with default values", () => {
    const res = computeFootprint(DEFAULT_ASSESSMENT);
    expect(res.totalKg).toBeGreaterThan(0);
    expect(res.totalTonnes).toBe(+(res.totalKg / 1000).toFixed(2));
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(res.score).toBeLessThanOrEqual(100);
    expect(res.breakdown).toHaveProperty("Transportation");
    expect(res.breakdown).toHaveProperty("Electricity");
    expect(res.breakdown).toHaveProperty("Food");
    expect(res.breakdown).toHaveProperty("Shopping");
    expect(res.breakdown).toHaveProperty("Waste");
    expect(res.breakdown).toHaveProperty("Travel");
  });

  it("should calculate lower footprint for a low-impact lifestyle", () => {
    const ecoFriendly: AssessmentData = {
      transportation: 0,
      publicTransit: 0,
      flights: 0,
      electricity: 50,
      renewableShare: 100,
      diet: "vegan",
      localFood: 100,
      shoppingFrequency: "low",
      fastFashion: false,
      recyclingRate: 100,
      compost: true,
      travelHabits: "rare",
    };

    const res = computeFootprint(ecoFriendly);
    expect(res.totalTonnes).toBeLessThan(3);
    expect(res.score).toBeGreaterThanOrEqual(85);
    expect(res.rating).toBe("Champion");
  });

  it("should calculate higher footprint for a high-impact lifestyle", () => {
    const highImpact: AssessmentData = {
      transportation: 800,
      publicTransit: 100,
      flights: 15,
      electricity: 1500,
      renewableShare: 0,
      diet: "heavy-meat",
      localFood: 0,
      shoppingFrequency: "very-high",
      fastFashion: true,
      recyclingRate: 0,
      compost: false,
      travelHabits: "very-frequent",
    };

    const res = computeFootprint(highImpact);
    expect(res.totalTonnes).toBeGreaterThan(10);
    expect(res.score).toBeLessThan(30);
    expect(res.rating).toBe("High Impact");
  });
});

describe("badge allocations", () => {
  it("should assign correct badge according to scores", () => {
    expect(badgeForScore(90).name).toBe("Eco Champion");
    expect(badgeForScore(90).tier).toBe(5);

    expect(badgeForScore(75).name).toBe("Eco Leader");
    expect(badgeForScore(75).tier).toBe(4);

    expect(badgeForScore(60).name).toBe("Green Advocate");
    expect(badgeForScore(60).tier).toBe(3);

    expect(badgeForScore(45).name).toBe("Eco Aware");
    expect(badgeForScore(45).tier).toBe(2);

    expect(badgeForScore(20).name).toBe("Getting Started");
    expect(badgeForScore(20).tier).toBe(1);
  });
});
