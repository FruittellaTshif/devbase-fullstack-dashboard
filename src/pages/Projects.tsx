import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Loader,
  Modal,
  Pagination,
  SegmentedControl,
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
  IconSearch,
  IconTrash,
  IconChecklist,
} from "@tabler/icons-react";

import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
  type Project,
  type ProjectSortBy,
  type ProjectsListResponse,
  type SortOrder,
} from "../services/projects.service";

import { tasksService } from "../services/tasks.service";
import type { TaskApi, TaskStatusApi } from "../services/tasks.service";

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

// Tasks UI mapping
type UiStatus = "Todo" | "Doing" | "Done";
const apiToUi: Record<TaskStatusApi, UiStatus> = {
  TODO: "Todo",
  DOING: "Doing",
  DONE: "Done",
};
const uiToApi: Record<UiStatus, TaskStatusApi> = {
  Todo: "TODO",
  Doing: "DOING",
  Done: "DONE",
};

type UiTask = {
  id: string;
  title: string;
  status: UiStatus;
  projectId: string;
  createdAt: string;
};

function toUiTask(t: TaskApi): UiTask {
  return {
    id: t.id,
    title: t.title,
    status: apiToUi[t.status],
    projectId: t.projectId,
    createdAt: t.createdAt,
  };
}

const TASK_STATUS_OPTIONS: Array<{ value: UiStatus; label: string }> = [
  { value: "Todo", label: "Todo" },
  { value: "Doing", label: "Doing" },
  { value: "Done", label: "Done" },
];

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(search, 350);

  const [sortBy, setSortBy] = useState<ProjectSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false); // actions
  const [error, setError] = useState<string | null>(null);

  // Create project
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // Edit project
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Delete project
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  // Drawer Tasks
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<UiTask[]>([]);

  // Create task in drawer
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState<UiStatus>("Todo");

  // Edit task title
  const [taskEditOpen, setTaskEditOpen] = useState(false);
  const [taskEditId, setTaskEditId] = useState<string | null>(null);
  const [taskEditTitle, setTaskEditTitle] = useState("");

  // Delete task
  const [taskDeleteOpen, setTaskDeleteOpen] = useState(false);
  const [taskDeleteId, setTaskDeleteId] = useState<string | null>(null);
  const [taskDeleteTitle, setTaskDeleteTitle] = useState("");

  const query = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      sortBy,
      sortOrder,
    }),
    [page, pageSize, debouncedSearch, sortBy, sortOrder],
  );

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res: ProjectsListResponse = await listProjects(query);

      setItems(Array.isArray(res.items) ? res.items : []);
      setTotalPages(typeof res.totalPages === "number" ? res.totalPages : 1);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Impossible de charger les projets.";
      setError(msg);
      setItems([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, pageSize, sortBy, sortOrder]);

  async function onCreateProject() {
    const name = createName.trim();
    if (name.length < 2) {
      setError("Nom du projet : minimum 2 caractères.");
      return;
    }

    try {
      setBusy(true);
      setError(null);

      await createProject({ name });

      setCreateOpen(false);
      setCreateName("");
      setPage(1);
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de créer le projet.",
      );
    } finally {
      setBusy(false);
    }
  }

  function openEdit(p: Project) {
    setEditId(p.id);
    setEditName(p.name);
    setEditOpen(true);
  }

  async function onEditProject() {
    if (!editId) return;

    const name = editName.trim();
    if (name.length < 2) {
      setError("Nom du projet : minimum 2 caractères.");
      return;
    }

    try {
      setBusy(true);
      setError(null);

      await updateProject(editId, { name });

      setEditOpen(false);
      setEditId(null);
      setEditName("");
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de modifier le projet.",
      );
    } finally {
      setBusy(false);
    }
  }

  function openDelete(p: Project) {
    setDeleteTarget(p);
    setDeleteOpen(true);
  }

  async function onDeleteProjectConfirm() {
    if (!deleteTarget) return;

    try {
      setBusy(true);
      setError(null);

      await deleteProject(deleteTarget.id);

      setDeleteOpen(false);
      setDeleteTarget(null);

      if (items.length === 1 && page > 1) setPage(page - 1);
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Impossible de supprimer le projet.",
      );
    } finally {
      setBusy(false);
    }
  }

  // -------------------------
  // Tasks drawer logic
  // -------------------------
  async function loadTasksForProject(project: Project) {
    try {
      setTasksLoading(true);
      setTasksError(null);

      const apiTasks = await tasksService.list({ projectId: project.id });
      setTasks(apiTasks.map(toUiTask));
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : "Unable to load tasks");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }

  async function openTasksDrawer(project: Project) {
    setActiveProject(project);
    setDrawerOpen(true);
    await loadTasksForProject(project);
  }

  function openTaskCreate() {
    setTaskTitle("");
    setTaskStatus("Todo");
    setTaskCreateOpen(true);
  }

  async function onCreateTask() {
    if (!activeProject) return;
    const title = taskTitle.trim();
    if (title.length < 1) {
      setTasksError("Task title is required.");
      return;
    }

    try {
      setBusy(true);
      setTasksError(null);

      await tasksService.create({
        title,
        projectId: activeProject.id,
        status: uiToApi[taskStatus],
      });

      setTaskCreateOpen(false);
      await loadTasksForProject(activeProject);
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : "Unable to create task");
    } finally {
      setBusy(false);
    }
  }

  function openTaskEdit(t: UiTask) {
    setTaskEditId(t.id);
    setTaskEditTitle(t.title);
    setTaskEditOpen(true);
  }

  async function onEditTask() {
    if (!taskEditId || !activeProject) return;
    const title = taskEditTitle.trim();
    if (title.length < 1) {
      setTasksError("Task title is required.");
      return;
    }

    try {
      setBusy(true);
      setTasksError(null);

      await tasksService.update(taskEditId, { title });

      setTaskEditOpen(false);
      setTaskEditId(null);
      setTaskEditTitle("");

      await loadTasksForProject(activeProject);
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : "Unable to update task");
    } finally {
      setBusy(false);
    }
  }

  async function changeTaskStatus(t: UiTask, next: UiStatus) {
    try {
      setBusy(true);
      setTasksError(null);

      await tasksService.update(t.id, { status: uiToApi[next] });
      setTasks((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, status: next } : x)),
      );
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : "Unable to update status");
    } finally {
      setBusy(false);
    }
  }

  function openTaskDelete(t: UiTask) {
    setTaskDeleteId(t.id);
    setTaskDeleteTitle(t.title);
    setTaskDeleteOpen(true);
  }

  async function onDeleteTaskConfirm() {
    if (!taskDeleteId || !activeProject) return;

    try {
      setBusy(true);
      setTasksError(null);

      await tasksService.remove(taskDeleteId);

      setTaskDeleteOpen(false);
      setTaskDeleteId(null);
      setTaskDeleteTitle("");

      await loadTasksForProject(activeProject);
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : "Unable to delete task");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack>
      {/* Project modals */}
      <Modal
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New project"
        centered
      >
        <Stack>
          <TextInput
            label="Project name"
            placeholder="Ex: DevBase Dashboard"
            value={createName}
            onChange={(e) => setCreateName(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={onCreateProject}
              loading={busy}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit project"
        centered
      >
        <Stack>
          <TextInput
            label="Project name"
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              leftSection={<IconPencil size={16} />}
              onClick={onEditProject}
              loading={busy}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete project"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete{" "}
            <Text span fw={700}>
              {deleteTarget?.name}
            </Text>
            ?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={onDeleteProjectConfirm}
              loading={busy}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Header */}
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Projects</Title>
          <Text size="sm" c="dimmed">
            {total} project(s) • Page {page} / {totalPages}
          </Text>
        </div>

        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setCreateOpen(true)}
        >
          New project
        </Button>
      </Group>

      {/* Controls */}
      <Card withBorder radius="md">
        <Stack>
          <Group grow align="flex-end">
            <TextInput
              label="Search"
              placeholder="Search by name..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <Select
              label="Sort by"
              data={[
                { value: "createdAt", label: "Created date" },
                { value: "updatedAt", label: "Updated date" },
                { value: "name", label: "Name" },
              ]}
              value={sortBy}
              onChange={(v) => setSortBy((v as ProjectSortBy) ?? "createdAt")}
              allowDeselect={false}
            />

            <Select
              label="Page size"
              data={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
              ]}
              value={String(pageSize)}
              onChange={(v) => setPageSize(Number(v ?? 10))}
              allowDeselect={false}
            />
          </Group>

          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Order
            </Text>
            <SegmentedControl
              value={sortOrder}
              onChange={(v) => setSortOrder(v as SortOrder)}
              data={[
                { label: "Desc", value: "desc" },
                { label: "Asc", value: "asc" },
              ]}
            />
          </Group>
        </Stack>
      </Card>

      {/* Error */}
      {error ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} title="Erreur">
          {error}
        </Alert>
      ) : null}

      {/* Content */}
      {loading ? (
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      ) : items.length === 0 ? (
        <Card withBorder radius="md">
          <Stack align="center" py="xl">
            <Text fw={600}>No projects found</Text>
            <Text size="sm" c="dimmed" ta="center">
              Try a different search, or create your first project.
            </Text>
            <Button
              mt="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateOpen(true)}
            >
              Create a project
            </Button>
          </Stack>
        </Card>
      ) : (
        <>
          {items.map((p) => (
            <Card
              key={p.id}
              withBorder
              radius="md"
              style={{ cursor: "pointer" }}
              onClick={() => openTasksDrawer(p)}
            >
              <Group justify="space-between" align="flex-start">
                <div>
                  <Group gap="xs">
                    <Text fw={700}>{p.name}</Text>
                    <Badge variant="light">Open tasks</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mt={6}>
                    Created: {formatDate(p.createdAt)}
                  </Text>
                </div>

                <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                  <Tooltip label="Edit">
                    <ActionIcon
                      variant="subtle"
                      onClick={() => openEdit(p)}
                      aria-label="Edit project"
                    >
                      <IconPencil size={18} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Delete">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => openDelete(p)}
                      aria-label="Delete project"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Card>
          ))}

          <Group justify="center" mt="md">
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        </>
      )}

      {/* Tasks Drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        size="lg"
        title={
          <Group gap="xs">
            <IconChecklist size={18} />
            <Text fw={700}>
              Tasks • {activeProject ? activeProject.name : "Project"}
            </Text>
          </Group>
        }
      >
        <Stack>
          {tasksError ? (
            <Alert
              color="red"
              icon={<IconAlertCircle size={18} />}
              title="Tasks error"
            >
              {tasksError}
            </Alert>
          ) : null}

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              ProjectId: {activeProject?.id}
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openTaskCreate}
              disabled={!activeProject || busy}
            >
              Add task
            </Button>
          </Group>

          {tasksLoading ? (
            <Group justify="center" mt="md">
              <Loader />
            </Group>
          ) : tasks.length === 0 ? (
            <Card withBorder radius="md">
              <Stack align="center" py="xl">
                <Text fw={600}>No tasks for this project</Text>
                <Text size="sm" c="dimmed" ta="center">
                  Create the first task to start tracking work.
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={openTaskCreate}
                  disabled={!activeProject || busy}
                >
                  Create a task
                </Button>
              </Stack>
            </Card>
          ) : (
            <Stack>
              {tasks.map((t) => (
                <Card key={t.id} withBorder radius="md">
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Text fw={700}>{t.title}</Text>
                      <Text size="xs" c="dimmed" mt={6}>
                        Created: {formatDate(t.createdAt)}
                      </Text>
                      <Group gap="xs" mt={8}>
                        <Badge variant="light">{t.status}</Badge>
                      </Group>
                    </div>

                    <Group gap="xs">
                      <Select
                        data={TASK_STATUS_OPTIONS}
                        value={t.status}
                        onChange={(v) =>
                          v && changeTaskStatus(t, v as UiStatus)
                        }
                        allowDeselect={false}
                        w={120}
                        disabled={busy}
                      />

                      <Tooltip label="Edit title">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => openTaskEdit(t)}
                          disabled={busy}
                        >
                          <IconPencil size={18} />
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip label="Delete">
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => openTaskDelete(t)}
                          disabled={busy}
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
        </Stack>
      </Drawer>

      {/* Task Create Modal */}
      <Modal
        opened={taskCreateOpen}
        onClose={() => setTaskCreateOpen(false)}
        title="New task"
        centered
      >
        <Stack>
          <TextInput
            label="Title"
            placeholder="Ex: Build UI"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.currentTarget.value)}
            required
          />
          <Select
            label="Status"
            data={TASK_STATUS_OPTIONS}
            value={taskStatus}
            onChange={(v) => setTaskStatus((v ?? "Todo") as UiStatus)}
            allowDeselect={false}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setTaskCreateOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={onCreateTask} loading={busy}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Task Edit Modal */}
      <Modal
        opened={taskEditOpen}
        onClose={() => setTaskEditOpen(false)}
        title="Edit task"
        centered
      >
        <Stack>
          <TextInput
            label="Title"
            value={taskEditTitle}
            onChange={(e) => setTaskEditTitle(e.currentTarget.value)}
            required
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setTaskEditOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button onClick={onEditTask} loading={busy}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Task Delete Modal */}
      <Modal
        opened={taskDeleteOpen}
        onClose={() => setTaskDeleteOpen(false)}
        title="Delete task"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete{" "}
            <Text span fw={700}>
              {taskDeleteTitle}
            </Text>
            ?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setTaskDeleteOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button color="red" onClick={onDeleteTaskConfirm} loading={busy}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
