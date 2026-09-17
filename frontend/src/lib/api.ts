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

export interface PaginatedDocuments {
  data: DocumentRecord[];
  meta: { page: number; limit: number; count: number };
}

export interface UpdateDocumentPayload {
  title: string;
  content: string;
  userId: string; // TEMPORARY — same caveat as create, until JWT-derived userId lands
}

export interface InviteUserPayload {
  email: string;
  role?: 'VIEWER' | 'EDITOR';
  userId: string; // TEMPORARY — same caveat as create/update, until JWT-derived userId lands
}

export interface DocumentPermissionRecord {
  id: string;
  documentId: string;
  userId: string;
  role: 'VIEWER' | 'EDITOR';
  createdAt: string;
  updatedAt: string;
}

export const documentsApi = {
  create: (payload: CreateDocumentPayload) =>
    request<DocumentRecord>('/auth/document', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listMine: (userId: string) =>
    request<PaginatedDocuments>(`/auth/documents?userId=${encodeURIComponent(userId)}`),

  getById: (documentId: string, userId: string) =>
    request<DocumentRecord>(
      `/auth/documents/${documentId}?userId=${encodeURIComponent(userId)}`,
    ),

  // NOTE: this calls PATCH /auth/documents/:id — you mentioned you're
  // building the update endpoint. Once it exists on the gateway +
  // documents-service (same shape as create/getById), this will work
  // as-is. Adjust the HTTP method/path here if you build it differently.
  update: (documentId: string, payload: UpdateDocumentPayload) =>
    request<DocumentRecord>(`/auth/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // NOTE: matches the same route shape as getById (DELETE + ?userId=...).
  // If your gateway route for delete looks different, adjust the path here.
  remove: (documentId: string, userId: string) =>
    request<void>(
      `/auth/documents/${documentId}?userId=${encodeURIComponent(userId)}`,
      { method: 'DELETE' },
    ),

  invite: (documentId: string, payload: InviteUserPayload) =>
    request<DocumentPermissionRecord>(`/auth/documents/${documentId}/invite`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export { ApiRequestError };
