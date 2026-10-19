/**
 * AI Cost Calculator
 *
 * Provides configurable, estimated cost accounting based on provider-reported token usage.
 * Rates are expressed per 1,000,000 (1 Million) tokens in USD.
 *
 * NOTE: All monetary amounts calculated here are ESTIMATES for observability, cost allocation,
 * and budget tracking. They do not represent exact third-party billing.
 */

export interface ModelPricing {
  promptCostPerMillion: number;
  completionCostPerMillion: number;
}

export const DEFAULT_MODEL_PRICING: Record<string, ModelPricing> = {
  // Groq standard models (per 1M tokens)
  'openai/gpt-oss-120b': { promptCostPerMillion: 0.59, completionCostPerMillion: 0.79 },
  'openai/gpt-oss-20b': { promptCostPerMillion: 0.20, completionCostPerMillion: 0.20 },
  'llama-3.3-70b-versatile': { promptCostPerMillion: 0.59, completionCostPerMillion: 0.79 },
  'llama-3.1-8b-instant': { promptCostPerMillion: 0.05, completionCostPerMillion: 0.08 },
  'qwen/qwen3.8-27b': { promptCostPerMillion: 0.20, completionCostPerMillion: 0.20 },

  // OpenAI secondary models (per 1M tokens)
  'gpt-4o-mini': { promptCostPerMillion: 0.15, completionCostPerMillion: 0.60 },
  'gpt-4o': { promptCostPerMillion: 2.50, completionCostPerMillion: 10.00 },
};

let runtimeCustomPricing: Record<string, ModelPricing> = {};

export function setCustomModelPricing(pricing: Record<string, ModelPricing>) {
  runtimeCustomPricing = { ...pricing };
}

export function getModelPricing(model: string): ModelPricing | null {
  if (runtimeCustomPricing[model]) {
    return runtimeCustomPricing[model];
  }

  if (process.env.AI_MODEL_PRICING_JSON) {
    try {
      const parsed = JSON.parse(process.env.AI_MODEL_PRICING_JSON);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed[model]) {
        const item = parsed[model];
        if (
          typeof item?.promptCostPerMillion === 'number' &&
          typeof item?.completionCostPerMillion === 'number'
        ) {
          return item;
        }
      }
    } catch {
      // Safely ignore malformed JSON or parse errors in env
    }
  }

  return DEFAULT_MODEL_PRICING[model] || null;
}

/**
 * Calculates estimated USD cost for a given model and token usage.
 * Returns null if token counts are unavailable (null/undefined) or model is unpriced.
 */
export function estimateCost(
  model: string,
  promptTokens: number | null,
  completionTokens: number | null
): number | null {
  if (promptTokens === null || completionTokens === null) {
    return null;
  }

  const pricing = getModelPricing(model);
  if (!pricing) {
    return null;
  }

  const pTokens = typeof promptTokens === 'number' && promptTokens > 0 ? promptTokens : 0;
  const cTokens = typeof completionTokens === 'number' && completionTokens > 0 ? completionTokens : 0;

  if (pTokens === 0 && cTokens === 0) {
    return 0;
  }

  const cost = (pTokens * pricing.promptCostPerMillion + cTokens * pricing.completionCostPerMillion) / 1_000_000;
  return Number(cost.toFixed(6));
}
