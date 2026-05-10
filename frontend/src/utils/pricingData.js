export const pricingData = {
  cursor: {
    name: 'Cursor',
    source: 'PRICING_DATA.md',
    type: 'seat',
    billingModel: 'seat',
    useCases: ['coding', 'mixed'],
    plans: {
      Hobby: 0,
      Pro: 20,
      Business: 40,
      Enterprise: 80,
    },
    seatThresholds: { Hobby: 1, Pro: 3, Business: 25, Enterprise: 999 },
    retailCreditDiscount: 0.25,
  },
  copilot: {
    name: 'GitHub Copilot',
    source: 'PRICING_DATA.md',
    type: 'seat',
    billingModel: 'seat',
    useCases: ['coding', 'mixed'],
    plans: {
      Individual: 10,
      Business: 19,
      Enterprise: 39,
    },
    seatThresholds: { Individual: 1, Business: 50, Enterprise: 999 },
    retailCreditDiscount: 0.15,
  },
  claude: {
    name: 'Claude',
    source: 'PRICING_DATA.md',
    type: 'hybrid',
    billingModel: 'hybrid',
    useCases: ['writing', 'research', 'coding', 'mixed'],
    plans: {
      Free: 0,
      Pro: 20,
      Max: 100,
      Team: 30,
      Enterprise: 60,
      'API direct': 0,
    },
    seatThresholds: { Free: 1, Pro: 2, Max: 2, Team: 50, Enterprise: 999, 'API direct': 999 },
    retailCreditDiscount: 0.25,
  },
  chatgpt: {
    name: 'ChatGPT',
    source: 'PRICING_DATA.md',
    type: 'hybrid',
    billingModel: 'hybrid',
    useCases: ['writing', 'data', 'research', 'mixed'],
    plans: {
      Plus: 20,
      Team: 25,
      Enterprise: 60,
      'API direct': 0,
    },
    seatThresholds: { Plus: 2, Team: 50, Enterprise: 999, 'API direct': 999 },
    retailCreditDiscount: 0.25,
  },
  anthropic: {
    name: 'Anthropic API',
    source: 'PRICING_DATA.md',
    type: 'api',
    billingModel: 'usage',
    useCases: ['coding', 'writing', 'research', 'mixed'],
    plans: {
      'API direct': 0,
    },
    seatThresholds: { 'API direct': 999 },
    retailCreditDiscount: 0.25,
  },
  openai: {
    name: 'OpenAI API',
    source: 'PRICING_DATA.md',
    type: 'api',
    billingModel: 'usage',
    useCases: ['data', 'writing', 'research', 'mixed'],
    plans: {
      'API direct': 0,
    },
    seatThresholds: { 'API direct': 999 },
    retailCreditDiscount: 0.25,
  },
  gemini: {
    name: 'Gemini',
    source: 'PRICING_DATA.md',
    type: 'hybrid',
    billingModel: 'hybrid',
    useCases: ['data', 'research', 'writing', 'mixed'],
    plans: {
      Pro: 100,
      Ultra: 240,
      'API direct': 0,
    },
    planRules: {
      Pro: 'flat',
      Ultra: 'flat',
      'API direct': 'usage',
    },
    seatThresholds: { Pro: 5, Ultra: 3, 'API direct': 999 },
    retailCreditDiscount: 0.2,
  },
  windsurf: {
    name: 'Windsurf',
    source: 'PRICING_DATA.md',
    type: 'seat',
    billingModel: 'seat',
    useCases: ['coding', 'mixed'],
    plans: {
      Free: 0,
      Pro: 15,
      Teams: 30,
      Enterprise: 60,
    },
    seatThresholds: { Free: 1, Pro: 3, Teams: 50, Enterprise: 999 },
    retailCreditDiscount: 0.15,
  },
  huggingface: {
    name: 'Hugging Face',
    source: 'PRICING_DATA.md',
    type: 'api',
    billingModel: 'usage',
    useCases: ['coding', 'data', 'research', 'mixed'],
    plans: {
      'API direct': 0,
    },
    seatThresholds: { 'API direct': 999 },
    retailCreditDiscount: 0.2,
  },
};

export const toolOptions = Object.entries(pricingData).map(([id, tool]) => ({
  id,
  name: tool.name,
  plans: Object.keys(tool.plans),
  type: tool.type,
  planTypes: Object.fromEntries(Object.keys(tool.plans).map((plan) => [plan, getToolPlanType(tool, plan)])),
}));

export function getToolPlanType(tool, planName) {
  if (!tool) {
    return 'reported';
  }

  if (tool.planRules?.[planName] === 'flat') {
    return 'flat';
  }

  if (tool.type === 'api' || tool.billingModel === 'usage' || planName.toLowerCase().includes('api')) {
    return 'api';
  }

  return 'seat';
}
