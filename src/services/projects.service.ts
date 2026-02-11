/**
 * projects.service.ts
 * ======================================================
 * Aligné avec le backend réel DevBase API
 *
 * Endpoints (backend):
 * - GET    /api/projects?page=&pageSize=&search=&sortBy=&sortOrder=
 *   -> { items: Project[], page, pageSize, total, totalPages }
 *
 * - POST   /api/projects
 *   body: { name }
 *   -> { project: Project }
 *
 * - GET    /api/projects/:id
 *   -> { project: Project }
 *
 * - PATCH  /api/projects/:id
 *   body: { name } (au moins 1 champ)
 *   -> { project: Project }
 *
 * - DELETE /api/projects/:id
 *   -> { ok: true }
 *
 * ⚠️ Projects côté backend = Zod strict()
 * => n'envoie PAS de paramètres inconnus
 */

import { apiFetch } from "../lib/api";

/** Modèle Project (selon Prisma + réponses API) */
export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

/** Réponse wrapper: { project: Project } */
export type ProjectResponse = {
  project: Project;
};

/** Réponse GET /api/projects */
export type ProjectsListResponse = {
  items: Project[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProjectSortBy = "createdAt" | "updatedAt" | "name";
export type SortOrder = "asc" | "desc";

/** Paramètres supportés par GET /api/projects (Zod strict) */
export type ListProjectsParams = {
  page?: number; // default 1
  pageSize?: number; // default 10
  search?: string; // optional
  sortBy?: ProjectSortBy; // default createdAt
  sortOrder?: SortOrder; // default desc
};

export type CreateProjectInput = {
  name: string;
};

export type UpdateProjectInput = {
  name?: string;
};

export type DeleteProjectResponse = {
  ok: true;
};

/**
 * Construit une query string propre (ignore undefined / empty)
 * IMPORTANT: backend strict => on n'ajoute que les params supportés
 */
function buildQuery(params: ListProjectsParams): string {
  const q = new URLSearchParams();

  if (typeof params.page === "number") q.set("page", String(params.page));
  if (typeof params.pageSize === "number")
    q.set("pageSize", String(params.pageSize));

  const search = params.search?.trim();
  if (search) q.set("search", search);

  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.sortOrder) q.set("sortOrder", params.sortOrder);

  const s = q.toString();
  return s ? `?${s}` : "";
}

/** GET /api/projects */
export function listProjects(
  params: ListProjectsParams = {
    page: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
): Promise<ProjectsListResponse> {
  const query = buildQuery(params);
  return apiFetch<ProjectsListResponse>(`/api/projects${query}`, {
    method: "GET",
  });
}

/** POST /api/projects -> { project } */
export function createProject(
  input: CreateProjectInput,
): Promise<ProjectResponse> {
  return apiFetch<ProjectResponse>("/api/projects", {
    method: "POST",
    body: input,
  });
}

/** GET /api/projects/:id -> { project } */
export function getProjectById(id: string): Promise<ProjectResponse> {
  return apiFetch<ProjectResponse>(`/api/projects/${id}`, { method: "GET" });
}

/** PATCH /api/projects/:id -> { project } */
export function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<ProjectResponse> {
  return apiFetch<ProjectResponse>(`/api/projects/${id}`, {
    method: "PATCH",
    body: input,
  });
}

/** DELETE /api/projects/:id -> { ok: true } */
export function deleteProject(id: string): Promise<DeleteProjectResponse> {
  return apiFetch<DeleteProjectResponse>(`/api/projects/${id}`, {
    method: "DELETE",
  });
}
