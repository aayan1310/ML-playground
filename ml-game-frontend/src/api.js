// Thin API client for the Level 1 backend (docs/data-contract.md).
// No mocking lives here: every call hits the real FastAPI service.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(code, detail, status) {
    super(code);
    this.name = 'ApiError';
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor() {
    super('network');
    this.name = 'NetworkError';
  }
}

/** Resolve a backend-relative image path (e.g. "images/img_007.jpg") to an absolute URL. */
export function imageUrl(path) {
  return new URL(path, `${API_BASE}/`).toString();
}

async function call(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new NetworkError();
  }
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    throw new ApiError(body?.code ?? 'invalid_request', body?.detail ?? null, response.status);
  }
  return body;
}

export function getSetup(levelId) {
  return call(`/api/level/${levelId}/setup`);
}

export function getPool(levelId, stage, accepted) {
  return call(`/api/level/${levelId}/pool`, {
    method: 'POST',
    body: JSON.stringify({ level: levelId, stage, accepted }),
  });
}

export function train(levelId, stage, choices) {
  return call(`/api/level/${levelId}/train`, {
    method: 'POST',
    body: JSON.stringify({ level: levelId, stage, choices }),
  });
}

export function predict(levelId, modelId, testId) {
  return call(`/api/level/${levelId}/predict`, {
    method: 'POST',
    body: JSON.stringify({ model_id: modelId, test_id: testId }),
  });
}

export function reveal(levelId, modelId, testId) {
  return call(`/api/level/${levelId}/reveal`, {
    method: 'POST',
    body: JSON.stringify({ model_id: modelId, test_id: testId }),
  });
}
