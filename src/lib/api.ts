/**
 * API client minimal (frontend)
 * =============================
 *
 * Objectifs :
 * - Centraliser TOUS les appels HTTP (GET / POST / PUT / PATCH / DELETE)
 * - Ajouter automatiquement le token JWT (accessToken) si présent
 * - Gérer proprement les erreurs renvoyées par l'API
 * - Supporter les réponses JSON OU texte
 *
 * Utilisé par :
 * - auth.service.ts
 * - projects.service.ts
 * - tasks.service.ts
 *
 * 👉 Aucune logique UI ici.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

/**
 * Normalise l’URL de base (évite les doubles slash)
 * "http://localhost:4000/" => "http://localhost:4000"
 */
const API_BASE_URL = (RAW_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Debug console (désactivé par défaut)
 * Pour l’activer : ajoute VITE_API_DEBUG=true dans ton .env
 */
const API_DEBUG = String(import.meta.env.VITE_API_DEBUG ?? "") === "true";

/** Méthodes HTTP autorisées */
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Format d'erreur potentiel renvoyé par l'API (souple) */
type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ path?: string; message?: string }>;
  };
  message?: string;
};

export function getAccessToken(): string | null {
  const token = localStorage.getItem("accessToken");
  return token && token.trim().length > 0 ? token : null;
}

export function setAccessToken(token: string): void {
  localStorage.setItem("accessToken", token);
}

export function clearAccessToken(): void {
  localStorage.removeItem("accessToken");
}

function extractErrorMessage(data: unknown, status: number): string {
  // Si texte brut
  if (typeof data === "string" && data.trim().length > 0) return data;

  // Si JSON (forme backend)
  if (typeof data === "object" && data !== null) {
    const maybe = data as ApiErrorShape;

    // Exemple: { error: { message: "...", details:[...] } }
    const details =
      maybe.error?.details
        ?.map((d) => d.message)
        .filter(Boolean)
        .join(" | ") ?? "";

    const main =
      maybe.error?.message || maybe.message || `Request failed (${status})`;

    return details ? `${main} — ${details}` : main;
  }

  return `Request failed (${status})`;
}

function buildUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * apiFetch<T>
 * -----------
 * - Ajoute Authorization: Bearer <token> si présent
 * - JSON body si fourni
 * - Parse JSON ou texte
 * - Throw Error si HTTP != OK
 */
export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const body = options.body;
  const token = options.token ?? getAccessToken();

  const headers = new Headers();

  // headers custom (optionnel)
  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) headers.set(k, v);
  }

  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = buildUrl(path);

  // ✅ LOGS DEBUG
  if (API_DEBUG) {
    console.log("[apiFetch]", {
      method,
      path,
      url,
      hasToken: Boolean(token),
      tokenPreview: token ? `${token.slice(0, 12)}...` : null,
      hasAuthHeader: headers.has("Authorization"),
    });
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // OK même si tu n’utilises pas cookies (ne casse rien)
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const data: unknown = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (API_DEBUG) {
    console.log("[apiFetch:response]", {
      path,
      status: response.status,
      ok: response.ok,
    });
    if (!response.ok) console.log("[apiFetch:errorBody]", { path, data });
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, response.status));
  }

  return data as T;
}
