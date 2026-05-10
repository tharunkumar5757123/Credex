import { describe, expect, test } from 'vitest';
import { runAudit } from '../src/utils/auditEngine.js';
import { pricingData } from '../src/utils/pricingData.js';

describe('audit engine', () => {
  test('finds plan-fit savings when seats fit a lower plan', () => {
    const audit = runAudit(
      {
        teamSize: 2,
        primaryUseCase: 'coding',
        tools: [{ id: 'copilot', plan: 'Business', seats: 1, monthlySpend: 80 }],
      },
      pricingData,
    );

    expect(audit.totalMonthlySavings).toBeGreaterThan(0);
    expect(['benchmark', 'downgrade']).toContain(audit.results[0].action);
  });

  test('does not manufacture savings for an efficient low-spend stack', () => {
    const audit = runAudit(
      {
        teamSize: 1,
        primaryUseCase: 'coding',
        tools: [{ id: 'copilot', plan: 'Individual', seats: 1, monthlySpend: 10 }],
      },
      pricingData,
    );

    expect(audit.totalMonthlySavings).toBe(0);
    expect(audit.results[0].recommendation).toContain('Keep this plan');
  });

  test('recommends discounted credits for high retail API spend', () => {
    const audit = runAudit(
      {
        teamSize: 8,
        primaryUseCase: 'mixed',
        tools: [{ id: 'openai', plan: 'API direct', seats: 8, monthlySpend: 1000 }],
      },
      pricingData,
    );

    expect(audit.results[0].action).toBe('credits');
    expect(audit.totalMonthlySavings).toBe(250);
  });

  test('considers cheaper alternatives for the same use case', () => {
    const audit = runAudit(
      {
        teamSize: 3,
        primaryUseCase: 'coding',
        tools: [{ id: 'cursor', plan: 'Enterprise', seats: 3, monthlySpend: 240 }],
      },
      pricingData,
    );

    expect(['alternative', 'downgrade', 'credits']).toContain(audit.results[0].action);
    expect(audit.results[0].potentialSavings).toBeGreaterThan(0);
  });

  test('calculates annual savings from monthly savings', () => {
    const audit = runAudit(
      {
        teamSize: 4,
        primaryUseCase: 'research',
        tools: [{ id: 'claude', plan: 'Enterprise', seats: 4, monthlySpend: 400 }],
      },
      pricingData,
    );

    expect(audit.totalAnnualSavings).toBe(audit.totalMonthlySavings * 12);
  });

  test('uses reported spend as truth and pricing as benchmark for seat tools', () => {
    const audit = runAudit(
      {
        teamSize: 3,
        primaryUseCase: 'coding',
        tools: [{ id: 'cursor', plan: 'Pro', seats: 3, monthlySpend: 120 }],
      },
      pricingData,
    );

    expect(audit.results[0].action).toBe('benchmark');
    expect(audit.results[0].expectedRetail).toBe(60);
    expect(audit.results[0].potentialSavings).toBe(60);
    expect(audit.results[0].calculation).toContain('$120 reported - $60 benchmark');
  });

  test('does not convert usage-based API spend into seat-plan alternatives', () => {
    const audit = runAudit(
      {
        teamSize: 3,
        primaryUseCase: 'mixed',
        tools: [{ id: 'huggingface', plan: 'API direct', seats: 3, monthlySpend: 300 }],
      },
      pricingData,
    );

    expect(audit.results[0].action).toBe('credits');
    expect(audit.results[0].recommendation).toContain('Optimize API usage tier');
    expect(audit.results[0].targetPlan.planModel).toBe('usage');
    expect(audit.results[0].currentPlan.seats).toBeNull();
    expect(audit.results[0].toolType).toBe('api');
    expect(audit.results[0].benchmarkAvailable).toBe(false);
    expect(audit.results[0].benchmarkSpend).toBeNull();
  });

  test('returns confidence scoring with separated reported and benchmark spend', () => {
    const audit = runAudit(
      {
        teamSize: 3,
        primaryUseCase: 'coding',
        tools: [{ id: 'cursor', plan: 'Pro', seats: 3, monthlySpend: 120 }],
      },
      pricingData,
    );

    expect(audit.results[0].reportedSpend).toBe(120);
    expect(audit.results[0].benchmarkSpend).toBe(60);
    expect(audit.results[0].confidence.level).toBe('High');
    expect(audit.results[0].confidence.score).toBeGreaterThanOrEqual(80);
    expect(audit.results[0].confidence.components.pricingMatch.score).toBe(100);
    expect(audit.results[0].confidence.components.usageCorrectness.score).toBe(100);
    expect(audit.results[0].confidence.components.mappingCorrectness.score).toBe(100);
  });

  test('uses one Gemini pricing family with plan variants', () => {
    const audit = runAudit(
      {
        teamSize: 3,
        primaryUseCase: 'research',
        tools: [{ id: 'gemini', plan: 'Ultra', seats: 3, monthlySpend: 900 }],
      },
      pricingData,
    );

    expect(audit.results[0].toolId).toBe('Gemini');
    expect(audit.results[0].toolType).toBe('flat');
    expect(audit.results[0].benchmarkSpend).toBe(240);
    expect(audit.results[0].benchmarkPlan.formula).toContain('$240 flat monthly benchmark');
    expect(audit.results[0].currentPlan.seats).toBeNull();
    expect(audit.results[0].confidence.score).toBe(97);
  });

  test('does not mark high savings as suspicious when pricing confidence is strong', () => {
    const audit = runAudit(
      {
        teamSize: 1,
        primaryUseCase: 'coding',
        tools: [{ id: 'cursor', plan: 'Hobby', seats: 1, monthlySpend: 240 }],
      },
      pricingData,
    );

    expect(audit.results[0].savingsRatio).toBeGreaterThan(0.8);
    expect(audit.results[0].needsVerification).toBe(false);
    expect(audit.results[0].riskLabel).toBe('High savings');
    expect(audit.results[0].confidence.score).toBe(100);
  });

  test('marks high savings as needing verification only when pricing confidence is low', () => {
    const audit = runAudit(
      {
        teamSize: 1,
        primaryUseCase: 'coding',
        tools: [{ id: 'cursor', plan: 'Legacy', seats: 1, monthlySpend: 240 }],
      },
      pricingData,
    );

    expect(audit.results[0].savingsRatio).toBeGreaterThan(0.8);
    expect(audit.results[0].confidence.components.pricingMatch.score).toBeLessThan(70);
    expect(audit.results[0].needsVerification).toBe(true);
    expect(audit.results[0].riskLabel).toBe('Needs verification');
  });
});
