import { apiFetch } from "../lib/api";

/**
 * Backend Task shape (d'après ton code backend / Prisma)
 * status backend = "TODO" | "DOING" | "DONE"
 */
export type TaskStatusApi = "TODO" | "DOING" | "DONE";

export type TaskApi = {
  id: string;
  title: string;
  status: TaskStatusApi;
  projectId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskPayload = {
  title: string;
  projectId: string;
  status?: TaskStatusApi;
};

export type UpdateTaskPayload = {
  title?: string;
  status?: TaskStatusApi;
};

export type ListTasksParams = {
  projectId?: string;
  status?: TaskStatusApi;
};

export type DeleteTaskResponse = {
  deleted: true; // ✅ backend réel: { deleted: true }
};

function buildQuery(params?: ListTasksParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.projectId) q.set("projectId", params.projectId);
  if (params.status) q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const tasksService = {
  list(params?: ListTasksParams): Promise<TaskApi[]> {
    const query = buildQuery(params);
    return apiFetch<TaskApi[]>(`/api/tasks${query}`);
  },

  getById(id: string): Promise<TaskApi> {
    return apiFetch<TaskApi>(`/api/tasks/${id}`);
  },

  create(payload: CreateTaskPayload): Promise<TaskApi> {
    return apiFetch<TaskApi>("/api/tasks", { method: "POST", body: payload });
  },

  update(id: string, payload: UpdateTaskPayload): Promise<TaskApi> {
    return apiFetch<TaskApi>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id: string): Promise<DeleteTaskResponse> {
    return apiFetch<DeleteTaskResponse>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
