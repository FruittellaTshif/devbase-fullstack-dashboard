import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

import { tasksService } from "../services/tasks.service";
import type { TaskApi, TaskStatusApi } from "../services/tasks.service";

type UiStatus = "Todo" | "Doing" | "Done";
const uiToApi: Record<UiStatus, TaskStatusApi> = {
  Todo: "TODO",
  Doing: "DOING",
  Done: "DONE",
};
const apiToUi: Record<TaskStatusApi, UiStatus> = {
  TODO: "Todo",
  DOING: "Doing",
  DONE: "Done",
};

type UiTask = {
  id: string;
  title: string;
  status: UiStatus;
  projectId: string;
  createdAt: string;
};

function toUi(t: TaskApi): UiTask {
  return {
    id: t.id,
    title: t.title,
    status: apiToUi[t.status],
    projectId: t.projectId,
    createdAt: t.createdAt,
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "TODO" },
  { value: "DOING", label: "DOING" },
  { value: "DONE", label: "DONE" },
];

const STATUS_EDIT: Array<{ value: UiStatus; label: string }> = [
  { value: "Todo", label: "Todo" },
  { value: "Doing", label: "Doing" },
  { value: "Done", label: "Done" },
];

export default function Tasks() {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<UiTask[]>([]);

  // Filters
  const [projectIdFilter, setProjectIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Search (client-side)
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createProjectId, setCreateProjectId] = useState("");
  const [createStatus, setCreateStatus] = useState<UiStatus>("Todo");

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteTaskTitle, setDeleteTaskTitle] = useState<string>("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);

      const apiTasks = await tasksService.list({
        projectId: projectIdFilter.trim() || undefined,
        status:
          statusFilter === "ALL" ? undefined : (statusFilter as TaskStatusApi),
      });

      setTasks(apiTasks.map(toUi));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to load tasks";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload quand filtres changent
  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdFilter, statusFilter]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.projectId.toLowerCase().includes(q),
    );
  }, [tasks, debouncedSearch]);

  function openCreate() {
    setCreateTitle("");
    setCreateProjectId(projectIdFilter.trim() || "");
    setCreateStatus("Todo");
    setCreateOpen(true);
  }

  async function onCreate() {
    const title = createTitle.trim();
    const projectId = createProjectId.trim();

    if (title.length < 1 || projectId.length < 10) {
      notifications.show({
        title: "Invalid task",
        message: "Title + valid projectId are required.",
        color: "red",
      });
      return;
    }

    try {
      setBusy(true);
      setError(null);

      const created = await tasksService.create({
        title,
        projectId,
        status: uiToApi[createStatus],
      });

      // Si on est filtré sur un projectId différent, on reload proprement
      await loadTasks();

      notifications.show({
        title: "Task created",
        message: `“${created.title}” created.`,
        color: "green",
      });

      setCreateOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to create task";
      setError(msg);
      notifications.show({
        title: "Create failed",
        message: msg,
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  }

  function openEdit(t: UiTask) {
    setEditId(t.id);
    setEditTitle(t.title);
    setEditOpen(true);
  }

  async function onEdit() {
    if (!editId) return;
    const title = editTitle.trim();
    if (title.length < 1) {
      setError("Title is required.");
      return;
    }

    try {
      setBusy(true);
      setError(null);

      await tasksService.update(editId, { title });
      await loadTasks();

      setEditOpen(false);
      setEditId(null);
      setEditTitle("");

      notifications.show({
        title: "Task updated",
        message: "Saved.",
        color: "green",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to update task";
      setError(msg);
      notifications.show({
        title: "Update failed",
        message: msg,
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(task: UiTask, next: UiStatus) {
    try {
      setBusy(true);
      setError(null);

      await tasksService.update(task.id, { status: uiToApi[next] });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to update status";
      setError(msg);
      notifications.show({
        title: "Update failed",
        message: msg,
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  }

  function openDelete(t: UiTask) {
    setDeleteTaskId(t.id);
    setDeleteTaskTitle(t.title);
    setDeleteOpen(true);
  }

  async function onDeleteConfirm() {
    if (!deleteTaskId) return;

    try {
      setBusy(true);
      setError(null);

      await tasksService.remove(deleteTaskId);
      await loadTasks();

      setDeleteOpen(false);
      setDeleteTaskId(null);
      setDeleteTaskTitle("");

      notifications.show({
        title: "Task deleted",
        message: "Deleted.",
        color: "green",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to delete task";
      setError(msg);
      notifications.show({
        title: "Delete failed",
        message: msg,
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={3}>Tasks</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Live data from DevBase API: GET /api/tasks (filters:
            projectId/status)
          </Text>
        </div>

        <Group>
          <Button
            variant="default"
            leftSection={
              loading ? <Loader size="xs" /> : <IconRefresh size={16} />
            }
            onClick={loadTasks}
            disabled={loading || busy}
          >
            Refresh
          </Button>

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openCreate}
            disabled={loading || busy}
          >
            New task
          </Button>
        </Group>
      </Group>

      <Card withBorder radius="md">
        <Stack>
          <Group grow align="flex-end">
            <TextInput
              label="Search (client-side)"
              placeholder="Search by title or projectId..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <TextInput
              label="Filter projectId (server)"
              placeholder="Optional projectId..."
              value={projectIdFilter}
              onChange={(e) => setProjectIdFilter(e.currentTarget.value)}
            />

            <Select
              label="Filter status (server)"
              data={STATUS_FILTERS}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v ?? "ALL")}
              allowDeselect={false}
            />
          </Group>

          <Text size="sm" c="dimmed">
            Showing {filtered.length} task(s)
          </Text>
        </Stack>
      </Card>

      {error ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} title="Erreur">
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      ) : filtered.length === 0 ? (
        <Card withBorder radius="md">
          <Stack align="center" py="xl">
            <Text fw={600}>No tasks found</Text>
            <Text size="sm" c="dimmed" ta="center">
              Try changing filters or create your first task.
            </Text>
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
              Create a task
            </Button>
          </Stack>
        </Card>
      ) : (
        <Stack>
          {filtered.map((t) => (
            <Card key={t.id} withBorder radius="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={700}>{t.title}</Text>
                  <Group gap="xs" mt={6}>
                    <Badge variant="light">{t.status}</Badge>
                    <Badge variant="outline">Project: {t.projectId}</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={6}>
                    Created: {formatDate(t.createdAt)}
                  </Text>
                </div>

                <Group gap="xs" align="center">
                  <Select
                    data={STATUS_EDIT}
                    value={t.status}
                    onChange={(v) => v && changeStatus(t, v as UiStatus)}
                    allowDeselect={false}
                    w={120}
                    disabled={busy}
                  />

                  <Tooltip label="Edit title">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => openEdit(t)}
                      disabled={busy}
                      aria-label="Edit task"
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Delete">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => openDelete(t)}
                      disabled={busy}
                      aria-label="Delete task"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {/* Create modal */}
      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New task"
        centered
        radius="lg"
      >
        <Stack gap="sm">
          <TextInput
            label="Title"
            placeholder="e.g. Implement pagination"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.currentTarget.value)}
            required
          />

          <TextInput
            label="Project ID"
            placeholder="Paste projectId"
            value={createProjectId}
            onChange={(e) => setCreateProjectId(e.currentTarget.value)}
            required
          />

          <Select
            label="Status"
            value={createStatus}
            data={STATUS_EDIT}
            onChange={(v) => setCreateStatus((v ?? "Todo") as UiStatus)}
            allowDeselect={false}
          />

          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={() => setCreateOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={onCreate} loading={busy}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit modal */}
      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit task"
        centered
        radius="lg"
      >
        <Stack gap="sm">
          <TextInput
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.currentTarget.value)}
            required
          />
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={() => setEditOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={onEdit} loading={busy}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete modal */}
      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete task"
        centered
        radius="lg"
      >
        <Stack gap="sm">
          <Text>
            Are you sure you want to delete{" "}
            <Text span fw={700}>
              {deleteTaskTitle}
            </Text>
            ?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              onClick={() => setDeleteOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button color="red" onClick={onDeleteConfirm} loading={busy}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
