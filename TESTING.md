# Testing Documentation — EcoTrack AI

This document details the testing architecture, suites, and configuration for the EcoTrack AI application.

## Testing Architecture

We use **Vitest** as our primary test runner, paired with **React Testing Library** and **jsdom** to simulate a browser environment for unit and component testing.

- **Test Runner**: Vitest (v3.0.5)
- **Environment**: jsdom (v26.0.0)
- **Component Utilities**: React Testing Library (v16.2.0)
- **Matcher Assertions**: `@testing-library/jest-dom`

---

## Test Suites Covered

We have implemented comprehensive unit and component test suites that cover the main features and calculation paths of EcoTrack AI:

1. **Carbon Footprint Calculations (`src/lib/assessment.test.ts`)**
   - Verifies the computation of CO₂e emission values across different lifestyle categories (Transportation, Electricity, Diet, Shopping, Waste, and Travel).
   - Validates that low-impact and high-impact custom parameters return correct emission ranges and ratings.
2. **Badge Allocations (`src/lib/assessment.test.ts`)**
   - Validates the badge tier logic (`Eco Champion` to `Getting Started`) according to the computed scores.
3. **Authentication Interface (`src/routes/auth.test.tsx`)**
   - Asserts the default rendering of Google sign-in and email forms.
   - Tests custom authentication triggers with Supabase client bindings.
4. **Dashboard Views (`src/routes/_authenticated/dashboard.test.tsx`)**
   - Asserts dashboard rendering and greeting displays.
   - Verifies metrics card values are present for annual footprint and comparison ratios.
5. **Questionnaire Forms (`src/routes/_authenticated/assessment.test.tsx`)**
   - Confirms questionnaire slider steps render properly.
   - Checks form submission handlers and browser local storage sync.
6. **AI Sustainability Coach (`src/routes/_authenticated/assistant.test.tsx`)**
   - Verifies suggestions list display.
   - Asserts correct rendering of chat user bubbles and assistant responses.
7. **Monthly Sustainability Reports (`src/routes/_authenticated/report.test.tsx`)**
   - Tests breakdown metrics table display.
   - Verifies report compilation logs and the local text file download click handler.
8. **Pollution Reduction Action Guide (`src/routes/_authenticated/guide.test.tsx`)**
   - Verifies rendering of weekly action plans and the categorized action library.
9. **User Account Profile Settings (`src/routes/_authenticated/profile.test.tsx`)**
   - Tests the rendering of personal details, profile values, best score badges, and checks profile updating through Supabase client triggers.

---

## Running the Tests

Ensure dependencies are installed, then run the test suites using the following package scripts:

### Run Tests Once

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Code Coverage Reports

```bash
npm run test:coverage
```

---

## Mocks and Stubs Configuration

To ensure tests execute in complete isolation without hitting active servers or crashing due to JSDOM environment limits, we use mock configurations in `vitest.setup.ts` and in individual test suites:

- **Supabase Client (`@/integrations/supabase/client`)**: Mocked to intercept database logs and authentication state calls.
- **Lovable SDK (`@/integrations/lovable/index`)**: Mocked to avoid actual OAuth redirection workflows.
- **Recharts**: Mocked because SVG layout calculations are not supported natively in jsdom. We mock `ResponsiveContainer`, `BarChart`, `PieChart`, etc., to avoid layout issues.
- **ResizeObserver**: Mocked globally in `vitest.setup.ts` since it is used by Radix and Recharts.
- **URL.createObjectURL**: Mocked to generate mock blobs during report compiles.
