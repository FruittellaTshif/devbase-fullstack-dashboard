import { apiFetch, setAccessToken, clearAccessToken } from "../lib/api";

/* =====================================================
   Types (alignés avec DevBase API)
   ===================================================== */

/** Payload envoyé pour login */
export type LoginPayload = {
  email: string;
  password: string;
};

/** Payload envoyé pour register */
export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
};

/** Utilisateur authentifié */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

/** Réponse renvoyée par login / register */
export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

/* =====================================================
   Helpers internes
   ===================================================== */

/**
 * Sauvegarde la session utilisateur
 * - token JWT (localStorage)
 * - user (localStorage)
 * - notifie l'application
 */
function saveSession(data: AuthResponse) {
  setAccessToken(data.accessToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  notifyAuthChanged();
}

/**
 * Supprime complètement la session utilisateur
 */
function clearSession() {
  clearAccessToken();
  localStorage.removeItem("user");
  notifyAuthChanged();
}

/**
 * Notifie l'app qu'un changement d'auth a eu lieu
 * (App.tsx écoute cet event)
 */
function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth:changed"));
}

/* =====================================================
   Service Auth
   ===================================================== */

export const authService = {
  /**
   * Login utilisateur
   * POST /api/auth/login
   * Retour : { accessToken, user }
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
      token: null, // pas de token requis
    });

    saveSession(data);
    return data;
  },

  /**
   * Register utilisateur
   * POST /api/auth/register
   * Retour : { accessToken, user }
   * → login automatique après inscription
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: payload,
      token: null, // pas de token requis
    });

    saveSession(data);
    return data;
  },

  /**
   * Logout utilisateur
   * - supprime token + user
   */
  logout() {
    clearSession();
  },

  /**
   * Récupère l'utilisateur stocké (si présent)
   */
  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
};
