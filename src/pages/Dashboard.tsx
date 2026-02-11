import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  SimpleGrid,
  Badge,
  Progress,
  Stack,
  Button,
  Loader,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import { tasksService } from "../services/tasks.service";
import {
  listProjects,
  type ProjectsListResponse,
} from "../services/projects.service";
import type { TaskApi } from "../services/tasks.service";

function safeDate(iso: string): number {
  const d = new Date(iso);
  const t = d.getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskApi[]>([]);
  const [projectsTotal, setProjectsTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      // ✅ 1) Tasks
      const apiTasks = await tasksService.list();
      setTasks(apiTasks);

      // ✅ 2) Projects total (API renvoie total)
      // On récupère juste le total, pas besoin de charger toute la liste
      const res: ProjectsListResponse = await listProjects({
        page: 1,
        pageSize: 1,
      });
      setProjectsTotal(typeof res.total === "number" ? res.total : 0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unable to load dashboard";
      setError(msg);
      setTasks([]);
      setProjectsTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const donePct =
      totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100);

    return {
      tasks: totalTasks,
      donePct,
      projects: projectsTotal,
      done,
    };
  }, [tasks, projectsTotal]);

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => safeDate(b.createdAt) - safeDate(a.createdAt))
      .slice(0, 6);
  }, [tasks]);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={3}>Dashboard</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Live stats from DevBase API.
          </Text>
        </div>

        <Button
          variant="default"
          leftSection={
            loading ? <Loader size="xs" /> : <IconRefresh size={16} />
          }
          onClick={load}
          disabled={loading}
        >
          Refresh
        </Button>
      </Group>

      {error ? (
        <Alert
          color="red"
          icon={<IconAlertCircle size={18} />}
          title="Dashboard error"
        >
          {error}
        </Alert>
      ) : null}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text c="dimmed" size="sm">
                Projects
              </Text>
              <Title order={2} mt={6}>
                {stats.projects}
              </Title>
              <Text c="dimmed" size="xs" mt={6}>
                GET /api/projects (total)
              </Text>
            </div>
            <Badge variant="light">API</Badge>
          </Group>
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text c="dimmed" size="sm">
                Tasks
              </Text>
              <Title order={2} mt={6}>
                {stats.tasks}
              </Title>
              <Text c="dimmed" size="xs" mt={6}>
                GET /api/tasks
              </Text>
            </div>
            <Badge variant="light">API</Badge>
          </Group>
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" align="flex-start">
            <div style={{ flex: 1 }}>
              <Text c="dimmed" size="sm">
                Done %
              </Text>
              <Title order={2} mt={6}>
                {stats.donePct}%
              </Title>
              <Progress value={stats.donePct} mt="sm" />
              <Text c="dimmed" size="xs" mt={6}>
                {stats.done} done / {stats.tasks} total
              </Text>
            </div>
            <Badge variant="light">API</Badge>
          </Group>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="lg" p="lg">
        <Group justify="space-between" align="center" mb="sm">
          <Title order={4}>Recent tasks</Title>
          <Badge variant="outline">{tasks.length}</Badge>
        </Group>

        {recentTasks.length === 0 ? (
          <Text c="dimmed">No tasks yet.</Text>
        ) : (
          <Stack gap="xs">
            {recentTasks.map((t) => (
              <Card key={t.id} withBorder radius="md" p="sm">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={700}>{t.title}</Text>
                    <Text c="dimmed" size="sm">
                      status: {t.status} — project: {t.projectId}
                    </Text>
                    <Text c="dimmed" size="xs" mt={4}>
                      created: {new Date(t.createdAt).toLocaleString()}
                    </Text>
                  </div>
                  <Badge variant="light">{t.status}</Badge>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
