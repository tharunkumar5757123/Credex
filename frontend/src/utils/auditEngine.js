export function runAudit(input, pricing) {
  const results = input.tools.map((tool) => {
    const toolPricing = pricing[tool.id];
    const reportedSpend = Number(tool.monthlySpend || 0);
    const planType = getPlanType(toolPricing, tool.plan);
    const currentPlan = buildReportedSpend(tool, toolPricing, reportedSpend, planType);
    const benchmarkPlan = calculateCost(tool, toolPricing, tool.plan);
    const benchmarkOption = findBenchmarkSavings(tool, toolPricing, currentPlan, benchmarkPlan);
    const sameVendorPlan = findCheaperPlan(tool, toolPricing, currentPlan);
    const alternative = findAlternative(tool, input.primaryUseCase, pricing, currentPlan);
    const creditOption = findCreditOption(toolPricing, currentPlan);
    const best = chooseBestAction([benchmarkOption, sameVendorPlan, alternative, creditOption]);

    const potentialSavings = best?.savings || 0;
    const recommendedSpend = best?.target.monthlyCost ?? reportedSpend;
    const savingsRatio = reportedSpend > 0 ? potentialSavings / reportedSpend : 0;
    const action = best?.type || 'keep';
    const confidence = buildConfidence({
      toolPricing,
      planType,
      actionType: action,
      benchmarkPlan,
    });
    const needsVerification = confidence.components.pricingMatch.score < 70 && savingsRatio > 0.8;

    return {
      toolId: toolPricing?.name || tool.id,
      toolType: planType === 'usage' ? 'api' : planType,
      currentSpend: reportedSpend,
      reportedSpend,
      benchmarkSpend: benchmarkPlan.monthlyCost,
      benchmarkAvailable: benchmarkPlan.available,
      expectedRetail: benchmarkPlan.monthlyCost,
      recommendedSpend,
      recommendation: best
        ? best.recommendation
        : 'Keep this plan and revisit after usage or seat count changes.',
      potentialSavings,
      savingsRatio,
      isHighlySuspect: needsVerification,
      needsVerification,
      riskLabel: needsVerification ? 'Needs verification' : savingsRatio > 0.8 ? 'High savings' : 'Normal range',
      reason: best
        ? appendVerificationWarning(best.reason, needsVerification)
        : 'Reported spend is already close to the lowest defensible option for this use case.',
      confidence,
      source: toolPricing?.source || 'PRICING_DATA.md',
      currentPlan,
      benchmarkPlan,
      targetPlan: best?.target || currentPlan,
      calculation: best?.calculation || `${formatMoney(reportedSpend)} - ${formatMoney(reportedSpend)} = $0/month`,
      confidenceReasons: buildConfidenceReasons(confidence),
      action,
    };
  });

  const totalMonthlySavings = results.reduce((sum, item) => sum + item.potentialSavings, 0);
  const totalCurrentMonthly = results.reduce((sum, item) => sum + item.currentSpend, 0);
  const totalOptimizedMonthly = results.reduce((sum, item) => sum + item.recommendedSpend, 0);

  // Calculate benchmark metrics
  const benchmarkMetrics = calculateBenchmarkMetrics(input, totalCurrentMonthly);

  return {
    totalCurrentMonthly,
    totalOptimizedMonthly,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    summary: buildFallbackSummary(input, totalMonthlySavings),
    results,
    benchmarkMetrics,
  };
}

function buildReportedSpend(tool, pricing, reportedSpend, planType) {
  return {
    toolName: pricing?.name || tool.id,
    planName: tool.plan,
    planModel: planType,
    unitPrice: null,
    seats: planType === 'seat' ? normalizeSeatCount(tool.seats) : null,
    monthlyCost: reportedSpend,
    formula: planType === 'usage'
      ? `${formatMoney(reportedSpend)} reported API usage`
      : `${formatMoney(reportedSpend)} reported monthly spend`,
    source: 'User input',
  };
}

function calculateCost(tool, pricing, planName, overrideToolName) {
  if (!pricing) {
    return unavailableBenchmark(tool.id, planName, 'No matching pricing metadata in PRICING_DATA.md.');
  }

  const planType = getPlanType(pricing, planName);
  const rate = pricing.plans[planName];

  if (rate == null) {
    return unavailableBenchmark(pricing.name, planName, 'Plan is not defined in PRICING_DATA.md.');
  }

  if (planType === 'usage') {
    return {
      toolName: overrideToolName || pricing.name,
      planName,
      planModel: 'usage',
      unitPrice: null,
      seats: null,
      monthlyCost: null,
      available: false,
      formula: 'Usage-only API spend; no benchmark cost is derived from seats.',
      source: pricing.source || 'PRICING_DATA.md',
    };
  }

  const planRule = pricing.planRules?.[planName] || 'seat';
  if (planRule === 'flat') {
    return {
      toolName: overrideToolName || pricing.name,
      planName,
      planModel: 'flat',
      unitPrice: rate,
      seats: null,
      monthlyCost: rate,
      available: true,
      formula: `${formatMoney(rate)} flat monthly benchmark`,
      source: pricing.source || 'PRICING_DATA.md',
    };
  }

  const seats = normalizeSeatCount(tool.seats);
  const monthlyCost = rate * seats;

  return {
    toolName: overrideToolName || pricing.name,
    planName,
    planModel: 'seat',
    unitPrice: rate,
    seats,
    monthlyCost,
    available: true,
    formula: `${formatMoney(rate)}/seat x ${seats} seat${seats === 1 ? '' : 's'} = ${formatMoney(monthlyCost)}/month`,
    source: pricing.source || 'PRICING_DATA.md',
  };
}

function unavailableBenchmark(toolName, planName, reason) {
  return {
    toolName,
    planName,
    planModel: 'unknown',
    unitPrice: null,
    seats: null,
    monthlyCost: null,
    available: false,
    formula: reason,
    source: 'PRICING_DATA.md',
  };
}

function findBenchmarkSavings(tool, pricing, currentPlan, benchmarkPlan) {
  if (!pricing || currentPlan.planModel === 'usage' || !benchmarkPlan.available) {
    return null;
  }

  if (currentPlan.monthlyCost <= benchmarkPlan.monthlyCost) {
    return null;
  }

  const savings = currentPlan.monthlyCost - benchmarkPlan.monthlyCost;

  return {
    type: 'benchmark',
    savings,
    target: {
      ...benchmarkPlan,
      planName: `${benchmarkPlan.planName} benchmark`,
    },
    recommendation: `Reconcile invoice to the ${pricing.name} ${tool.plan} benchmark.`,
    reason: benchmarkPlan.planModel === 'flat'
      ? 'Reported spend is above the PRICING_DATA.md flat benchmark, so the first action is invoice cleanup before changing tools.'
      : `Reported spend is above the PRICING_DATA.md benchmark for ${benchmarkPlan.seats} seat(s), so the first action is invoice cleanup before changing tools.`,
    calculation: `${formatMoney(currentPlan.monthlyCost)} reported - ${formatMoney(benchmarkPlan.monthlyCost)} benchmark = ${formatMoney(savings)}/month`,
  };
}

function findCheaperPlan(tool, pricing, currentPlan) {
  if (!pricing || currentPlan.planModel === 'usage') {
    return null;
  }

  let best = null;
  const seats = normalizeSeatCount(tool.seats);

  for (const planName of Object.keys(pricing.plans)) {
    if (planName === tool.plan || getPlanType(pricing, planName) === 'usage') {
      continue;
    }

    const target = calculateCost(tool, pricing, planName);
    const threshold = pricing.seatThresholds?.[planName];
    const seatFits = target.planModel === 'flat' || threshold == null || seats <= threshold;

    if (seatFits && target.available && target.monthlyCost < currentPlan.monthlyCost) {
      const savings = currentPlan.monthlyCost - target.monthlyCost;
      if (!best || savings > best.savings) {
        best = {
          type: 'downgrade',
          savings,
          target,
          recommendation: `Switch to ${pricing.name} ${planName}.`,
          reason: target.planModel === 'flat'
            ? `${planName} has a lower flat benchmark than the current reported spend.`
            : `${seats} seat(s) fit ${planName}; the lower tier is cheaper than the current reported spend.`,
          calculation: `${formatMoney(currentPlan.monthlyCost)} - ${formatMoney(target.monthlyCost)} = ${formatMoney(savings)}/month`,
        };
      }
    }
  }

  return best;
}

function findAlternative(tool, useCase, pricing, currentPlan) {
  if (currentPlan.planModel === 'usage') {
    return null;
  }

  const seats = normalizeSeatCount(tool.seats);
  const alternatives = Object.entries(pricing)
    .filter(([id, data]) => id !== tool.id && data.useCases?.includes(useCase))
    .map(([id, data]) => {
      const planName = pickPlanForSeats(data, seats);
      const target = planName ? calculateCost(tool, data, planName, data.name) : null;
      return {
        id,
        name: data.name,
        planName,
        target,
      };
    })
    .filter((candidate) => candidate.planName && candidate.target?.available && candidate.target.monthlyCost > 0);

  const best = alternatives.sort((a, b) => a.target.monthlyCost - b.target.monthlyCost)[0];
  if (!best || best.target.monthlyCost >= currentPlan.monthlyCost * 0.75) {
    return null;
  }

  const savings = currentPlan.monthlyCost - best.target.monthlyCost;

  return {
    type: 'alternative',
    savings,
    target: best.target,
    recommendation: `Compare against ${best.name} ${best.planName}.`,
    reason: `The alternative is at least 25% cheaper for ${seats} seat(s), so it is worth a procurement review before renewal.`,
    calculation: `${formatMoney(currentPlan.monthlyCost)} - ${formatMoney(best.target.monthlyCost)} = ${formatMoney(savings)}/month`,
  };
}

function findCreditOption(pricing, currentPlan) {
  const baselineSpend = currentPlan.monthlyCost;

  if (!pricing?.retailCreditDiscount || currentPlan.planModel !== 'usage' || baselineSpend < 200) {
    return null;
  }

  const savings = baselineSpend * pricing.retailCreditDiscount;
  const target = {
    ...currentPlan,
    monthlyCost: baselineSpend - savings,
    formula: `${formatMoney(baselineSpend)} usage x ${(1 - pricing.retailCreditDiscount) * 100}% net credit cost = ${formatMoney(baselineSpend - savings)}/month`,
  };

  return {
    type: 'credits',
    savings,
    target,
    recommendation: 'Optimize API usage tier or switch to a lower-cost model equivalent.',
    reason: `At this spend level, a ${(pricing.retailCreditDiscount * 100).toFixed(0)}% credit discount is a defensible savings lever without changing tools.`,
    calculation: `${formatMoney(baselineSpend)} x ${(pricing.retailCreditDiscount * 100).toFixed(0)}% = ${formatMoney(savings)}/month`,
  };
}

function pickPlanForSeats(toolPricing, seats) {
  return Object.entries(toolPricing.seatThresholds || {})
    .filter(([, threshold]) => seats <= threshold)
    .map(([planName]) => planName)
    .filter((planName) => getPlanType(toolPricing, planName) !== 'usage')
    .find((planName) => toolPricing.plans[planName] > 0);
}

function chooseBestAction(actions) {
  const benchmarkAction = actions.find((action) => action?.type === 'benchmark');
  if (benchmarkAction) {
    return benchmarkAction;
  }

  return actions
    .filter(Boolean)
    .sort((a, b) => b.savings - a.savings)[0] || null;
}

function getPlanType(pricing, planName) {
  if (!pricing) {
    return 'unknown';
  }

  if (pricing.planRules?.[planName] === 'flat') {
    return 'flat';
  }

  if (pricing.type === 'api' || pricing.billingModel === 'usage' || planName.toLowerCase().includes('api')) {
    return 'usage';
  }

  return 'seat';
}

function normalizeSeatCount(seats) {
  return Math.max(1, Number(seats || 1));
}

function buildConfidence({ toolPricing, planType, actionType, benchmarkPlan }) {
  const pricingMatch = getPricingMatchScore(toolPricing, benchmarkPlan, actionType);
  const usageCorrectness = getUsageCorrectnessScore(planType, actionType);
  const mappingCorrectness = getMappingCorrectnessScore(toolPricing, planType);
  const score = Math.round(
    pricingMatch.score * 0.4 + usageCorrectness.score * 0.3 + mappingCorrectness.score * 0.3,
  );
  const level = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

  return {
    level,
    score,
    label: `${level} confidence`,
    rationale: [
      pricingMatch.reason,
      usageCorrectness.reason,
      mappingCorrectness.reason,
    ].filter(Boolean).join(' '),
    components: {
      pricingMatch,
      usageCorrectness,
      mappingCorrectness,
    },
  };
}

function getPricingMatchScore(toolPricing, benchmarkPlan, actionType) {
  if (!toolPricing) {
    return { score: 0, reason: 'Pricing match: no tool match in PRICING_DATA.md.' };
  }

  if (actionType === 'credits') {
    return { score: 70, reason: 'Pricing match: API credit assumption is defined, but not a unit-price benchmark.' };
  }

  if (benchmarkPlan.available) {
    return { score: 100, reason: 'Pricing match: selected plan has an exact PRICING_DATA.md rate.' };
  }

  return { score: 45, reason: 'Pricing match: no benchmark cost is available for this plan type.' };
}

function getUsageCorrectnessScore(planType, actionType) {
  if (planType === 'usage' && actionType !== 'benchmark' && actionType !== 'downgrade' && actionType !== 'alternative') {
    return { score: 100, reason: 'Usage correctness: API spend is evaluated only as reported usage.' };
  }

  if (planType === 'usage') {
    return { score: 40, reason: 'Usage correctness: API spend should not be compared against seat plans.' };
  }

  if (planType === 'seat') {
    return { score: 100, reason: 'Usage correctness: seat spend uses seats multiplied by plan price.' };
  }

  if (planType === 'flat') {
    return { score: 100, reason: 'Usage correctness: flat subscription plans use the defined plan benchmark.' };
  }

  return { score: 60, reason: 'Usage correctness: billing type required fallback interpretation.' };
}

function getMappingCorrectnessScore(toolPricing, planType) {
  if (!toolPricing) {
    return { score: 0, reason: 'Tool mapping: unknown tool.' };
  }

  if (toolPricing.type === 'hybrid') {
    return { score: 90, reason: 'Tool mapping: hybrid tool is explicitly resolved by selected plan rule.' };
  }

  if ((toolPricing.type === 'api' && planType === 'usage') || (toolPricing.type === 'seat' && planType === 'seat')) {
    return { score: 100, reason: 'Tool mapping: tool type matches the selected billing rule.' };
  }

  return { score: 55, reason: 'Tool mapping: billing rule required fallback interpretation.' };
}

function calculateBenchmarkMetrics(input, totalCurrentMonthly) {
  const teamSize = input.teamSize;
  const spendPerDeveloper = teamSize > 0 ? totalCurrentMonthly / teamSize : 0;

  // Industry averages based on team size (rough estimates)
  let industryAverage;
  if (teamSize <= 5) {
    industryAverage = 150; // Small teams
  } else if (teamSize <= 20) {
    industryAverage = 200; // Medium teams
  } else if (teamSize <= 50) {
    industryAverage = 300; // Large teams
  } else {
    industryAverage = 400; // Enterprise teams
  }

  const comparison = spendPerDeveloper > industryAverage ? 'above' : 'below';

  return {
    spendPerDeveloper: Math.round(spendPerDeveloper),
    industryAverage,
    comparison,
    teamSizeCategory: teamSize <= 5 ? 'small' : teamSize <= 20 ? 'medium' : teamSize <= 50 ? 'large' : 'enterprise'
  };
}

function buildConfidenceReasons(confidence) {
  return [
    `${confidence.components.pricingMatch.reason} Weight: 40%.`,
    `${confidence.components.usageCorrectness.reason} Weight: 30%.`,
    `${confidence.components.mappingCorrectness.reason} Weight: 30%.`,
  ];
}

function appendVerificationWarning(reason, needsVerification) {
  if (!needsVerification) {
    return reason;
  }

  return `${reason} This savings ratio is above 80% with low pricing confidence, so verify the invoice and plan mapping before acting.`;
}

function formatMoney(value) {
  if (value == null) {
    return 'N/A';
  }

  return `$${Number(value || 0).toFixed(0)}`;
}

function buildFallbackSummary(input, totalMonthlySavings) {
  if (totalMonthlySavings >= 500) {
    return `Your ${input.teamSize}-person team has a meaningful AI spend optimization opportunity. The biggest savings are likely to come from plan-fit cleanup, alternative tools for the primary ${input.primaryUseCase} workflow, and discounted infrastructure credits where you are paying retail.`;
  }

  if (totalMonthlySavings < 100) {
    return `Your AI stack looks reasonably efficient for a ${input.teamSize}-person team. The best next step is to monitor seat growth and renewals rather than forcing unnecessary changes.`;
  }

  return `Your AI spend has moderate savings potential. A few plan changes or vendor comparisons could reduce monthly cost without disrupting the team's main ${input.primaryUseCase} workflow.`;
}
