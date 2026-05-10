// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://credex-j2dy.onrender.com/api';

/**
 * Save full audit (input + results)
 */
export async function saveAudit(input, audit) {
  try {
    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, audit }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Unable to save audit');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error while saving audit');
  }
}

/**
 * Generate AI explanation (Hugging Face / fallback handled backend-side)
 */
export async function explainAudit(input, audit) {
  try {
    const response = await fetch(`${API_BASE_URL}/audit/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, audit }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Unable to generate AI explanation');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'AI explanation request failed');
  }
}

export async function fetchSharedAudit(shareId) {
  try {
    const response = await fetch(`${API_BASE_URL}/audit/${shareId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Unable to fetch shared audit');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error while fetching shared audit');
  }
}

/**
 * Save lead capture data
 */
export async function saveLead(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || 'Unable to save lead');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error while saving lead');
  }
}