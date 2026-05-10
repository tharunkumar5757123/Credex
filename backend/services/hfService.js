const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';
const DEFAULT_HF_MODEL = 'deepseek-ai/DeepSeek-R1:fastest';

export async function generateAuditExplanation(input, audit) {
  const fallback = buildFallbackExplanation(input, audit);

  if (!process.env.HF_API_KEY) {
    return {
      ...fallback,
      provider: 'deterministic',
      status: 'skipped',
      note: 'HF_API_KEY is not configured.',
    };
  }

  try {
    const response = await fetch(HF_ROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.HF_MODEL || DEFAULT_HF_MODEL,
        messages: buildMessages(input, audit),
        max_tokens: 280,
        temperature: 0.25,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ...fallback,
        provider: 'deterministic',
        status: 'fallback',
        note: `Hugging Face request failed with HTTP ${response.status}: ${errorText.slice(0, 160)}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return {
        ...fallback,
        provider: 'deterministic',
        status: 'fallback',
        note: 'Hugging Face returned an empty explanation.',
      };
    }

    return {
      narrative: content,
      provider: 'huggingface',
      model: process.env.HF_MODEL || DEFAULT_HF_MODEL,
      status: 'generated',
    };
  } catch (error) {
    return {
      ...fallback,
      provider: 'deterministic',
      status: 'fallback',
      note: `Hugging Face request failed: ${error.message}`,
    };
  }
}

function buildMessages(input, audit) {
  const topResults = audit.results
    .slice()
    .sort((a, b) => b.potentialSavings - a.potentialSavings)
    .slice(0, 4)
    .map((item) => ({
      tool: item.toolId,
      type: item.toolType,
      reportedSpend: item.reportedSpend,
      benchmarkSpend: item.benchmarkSpend,
      recommendedSpend: item.recommendedSpend,
      savings: item.potentialSavings,
      confidence: item.confidence?.score,
      risk: item.riskLabel,
      recommendation: item.recommendation,
    }));

  return [
    {
      role: 'system',
      content: [
        'You write concise SaaS spend audit explanations.',
        'Do not change the math.',
        'Do not invent tools, pricing, or savings.',
        'Use plain business language for a founder or engineering manager.',
      ].join(' '),
    },
    {
      role: 'user',
      content: JSON.stringify({
        teamSize: input.teamSize,
        primaryUseCase: input.primaryUseCase,
        totalCurrentMonthly: audit.totalCurrentMonthly,
        totalOptimizedMonthly: audit.totalOptimizedMonthly,
        totalMonthlySavings: audit.totalMonthlySavings,
        totalAnnualSavings: audit.totalAnnualSavings,
        topResults,
        task: 'Write a 3-sentence executive explanation plus one next-best action.',
      }),
    },
  ];
}

function buildFallbackExplanation(input, audit) {
  const topSaving = audit.results
    .slice()
    .sort((a, b) => b.potentialSavings - a.potentialSavings)[0];

  const action = topSaving?.potentialSavings > 0
    ? `Start with ${topSaving.toolId}: ${topSaving.recommendation}`
    : 'Keep monitoring seat growth, usage changes, and renewal dates.';

  return {
    narrative: `This ${input.teamSize}-person ${input.primaryUseCase} team has an estimated ${formatMoney(audit.totalMonthlySavings)} monthly savings opportunity, or ${formatMoney(audit.totalAnnualSavings)} annually. The audit keeps reported spend separate from benchmark pricing, then applies confidence checks before recommending changes. Next best action: ${action}`,
  };
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(0)}`;
}
