import { apiFetch } from "../lib/api";
import type { TaskApi } from "./tasks.service";
import type { Project } from "./projects.service";

/**
 * Réponse réelle renvoyée par GET /api/projects
 * (selon ton Postman)
 */
type ProjectsResponse = {
  items: Project[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/**
 * Récupère les données nécessaires au Dashboard (via API)
 * - Tasks: GET /api/tasks (confirmé)
 * - Projects: GET /api/projects?page=1&limit=10 (réponse = { items, page, ... })
 *
 * IMPORTANT :
 * - On retourne seulement "items" au dashboard (liste de projets)
 * - Comme ça, le Dashboard ne déclenche plus d'appel "projects" mal typé
 */
export async function fetchDashboardData(): Promise<{
  tasks: TaskApi[];
  projects: Project[] | null;
}> {
  // ✅ Tasks
  const tasks = await apiFetch<TaskApi[]>("/api/tasks");

  // ✅ Projects (aligné sur la vraie réponse)
  try {
    const res = await apiFetch<ProjectsResponse>(
      "/api/projects?page=1&limit=10",
    );
    return { tasks, projects: res.items };
  } catch {
    // Si /api/projects échoue, on garde tasks quand même
    return { tasks, projects: null };
  }
}
