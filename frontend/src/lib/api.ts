// Central place for talking to the backend.
// Point this at your api-gateway (or directly at users-service while
// the gateway isn't proxying auth yet) via an env var.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface ApiError {
  message: string;
  statusCode: number;
}

class ApiRequestError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // send/receive httpOnly cookies if you go that route for refresh tokens
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = body?.message ?? 'Something went wrong. Please try again.';
    throw new ApiRequestError(Array.isArray(message) ? message[0] : message, res.status);
  }

  return body as TResponse;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: LoginPayload) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface CreateDocumentPayload {
  title: string;
  content: string;
  userId: string; // TEMPORARY — sent explicitly until JWT-derived userId lands
}

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const documentsApi = {
  create: (payload: CreateDocumentPayload) =>
    request<DocumentRecord>('/auth/document', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // NOTE: this endpoint doesn't exist on the gateway/documents-service yet —
  // you'll need to add a GET route (e.g. GET /auth/documents?userId=...) that
  // proxies to a `{ cmd: 'get_documents' }` message pattern, matching the
  // create-document wiring you just built. Adjust the path below once it's built.
  listMine: (userId: string) =>
    request<DocumentRecord[]>(`/auth/documents?userId=${encodeURIComponent(userId)}`),
};

export { ApiRequestError };
