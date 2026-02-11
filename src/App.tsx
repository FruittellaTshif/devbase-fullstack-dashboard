import { useEffect, useMemo, useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Title,
  Text,
  ActionIcon,
  NavLink,
  Stack,
  Divider,
  ScrollArea,
  Card,
  Progress,
  Badge,
  Avatar,
  Menu,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconLayoutDashboard,
  IconFolder,
  IconChecklist,
  IconLogin,
  IconUserPlus,
  IconBell,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";

import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";

import { getAccessToken } from "./lib/api";
import { authService } from "./services/auth.service";
import type { AuthUser } from "./services/auth.service";

type PageKey =
  | "dashboard"
  | "projects"
  | "tasks"
  | "login"
  | "register"
  | "settings";

type DashboardStats = {
  projects: number;
  tasks: number;
  donePct: number;
};

const PROTECTED_PAGES: PageKey[] = [
  "dashboard",
  "projects",
  "tasks",
  "settings",
];

/**
 * Détermine si l'utilisateur est authentifié (token présent).
 * (Source: localStorage)
 */
function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * Convertit une URL (/projects, /tasks, etc.) en PageKey.
 * - Permet à l'app de "comprendre" l'URL au refresh / accès direct.
 */
function pathToPage(pathname: string): PageKey {
  const path = pathname.toLowerCase();

  if (path === "/" || path.startsWith("/dashboard")) return "dashboard";
  if (path.startsWith("/projects")) return "projects";
  if (path.startsWith("/tasks")) return "tasks";
  if (path.startsWith("/settings")) return "settings";
  if (path.startsWith("/login")) return "login";
  if (path.startsWith("/register")) return "register";

  // fallback
  return "dashboard";
}

/**
 * Convertit une PageKey en URL.
 * - Utilisé lors des clics sidebar pour garder une URL cohérente.
 */
function pageToPath(page: PageKey): string {
  switch (page) {
    case "dashboard":
      return "/";
    case "projects":
      return "/projects";
    case "tasks":
      return "/tasks";
    case "settings":
      return "/settings";
    case "login":
      return "/login";
    case "register":
      return "/register";
    default:
      return "/";
  }
}

export default function App() {
  const [mobileOpened, mobileHandlers] = useDisclosure(false);

  /**
   * Auth state
   */
  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getStoredUser(),
  );
  const [isAuthed, setIsAuthed] = useState<boolean>(() => isAuthenticated());

  /**
   * Navigation state :
   * - si connecté => dashboard
   * - sinon => login
   */
  const [activePage, setActivePage] = useState<PageKey>(() =>
    isAuthenticated() ? "dashboard" : "login",
  );

  /**
   * Helper centralisé pour changer de page :
   * - met à jour l'état
   * - met à jour l'URL (history.pushState) pour que /projects fonctionne
   * - ferme le menu mobile
   */
  function setPage(page: PageKey) {
    setActivePage(page);

    // Sync activePage -> URL (sans react-router, on utilise l'History API)
    const nextPath = pageToPath(page);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }

    mobileHandlers.close();
  }

  /**
   * ✅ Sync URL -> activePage au chargement + quand user fait Back/Forward.
   * Sans ça : taper /projects dans l'URL ne change pas la page.
   */
  useEffect(() => {
    function syncFromUrl() {
      const next = pathToPage(window.location.pathname);
      setActivePage(next);
    }

    // 1) Sync au premier render
    syncFromUrl();

    // 2) Sync quand l'utilisateur navigue via back/forward
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  /**
   * Écoute l'évènement global "auth:changed"
   * => synchronise user/token et redirige au bon endroit
   */
  useEffect(() => {
    function onAuthChanged() {
      const authed = isAuthenticated();
      setIsAuthed(authed);
      setUser(authService.getStoredUser());

      // Redirection contrôlée lors des changements d'auth uniquement
      // (et on garde l'URL en cohérence)
      const nextPage: PageKey = authed ? "dashboard" : "login";
      setActivePage(nextPage);

      const nextPath = pageToPath(nextPage);
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, "", nextPath);
      }
    }

    window.addEventListener("auth:changed", onAuthChanged);
    return () => window.removeEventListener("auth:changed", onAuthChanged);
  }, []);

  /**
   * Stats mock (on branchera plus tard sur API)
   */
  const stats: DashboardStats = useMemo(() => {
    const projects: number = 8;
    const tasks: number = 42;
    const done: number = 29;

    const donePct = tasks === 0 ? 0 : Math.round((done / tasks) * 100);
    return { projects, tasks, donePct };
  }, []);

  const pageTitle = useMemo(() => {
    switch (activePage) {
      case "dashboard":
        return "Dashboard";
      case "projects":
        return "Projects";
      case "tasks":
        return "Tasks";
      case "login":
        return "Login";
      case "register":
        return "Register";
      case "settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  }, [activePage]);

  /**
   * Guard :
   * - si page protégée et non connecté => on rend Login à la place
   */
  const isProtected = PROTECTED_PAGES.includes(activePage);
  const shouldShowLoginInstead = !isAuthed && isProtected;

  function logout() {
    authService.logout();
    notifications.show({
      title: "Logged out",
      message: "See you soon!",
      color: "green",
    });
  }

  const displayName = user?.name ?? "Guest";
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "G";

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      padding="lg"
    >
      {/* TOPBAR */}
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={mobileOpened}
              onClick={mobileHandlers.toggle}
              hiddenFrom="sm"
            />
            <Title order={3} style={{ letterSpacing: 0.2 }}>
              Project Manager Dashboard
            </Title>
            <Badge variant="light" color="blue">
              Nexus style
            </Badge>
          </Group>

          <Group gap="sm">
            <ActionIcon variant="subtle" size="lg" aria-label="Notifications">
              <IconBell size={20} />
            </ActionIcon>

            <Menu shadow="md" width={240} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="subtle"
                  leftSection={
                    <Avatar radius="xl" size={26}>
                      {avatarLetter}
                    </Avatar>
                  }
                >
                  <Text fw={600}>{displayName}</Text>
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>

                <Menu.Item
                  leftSection={<IconSettings size={16} />}
                  disabled={!isAuthed}
                  onClick={() => setPage("settings")}
                >
                  Settings
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={16} />}
                  disabled={!isAuthed}
                  onClick={logout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      {/* SIDEBAR */}
      <AppShell.Navbar p="md">
        <Stack gap="sm" h="100%">
          <Group justify="space-between">
            <Text fw={700} c="dimmed">
              Navigation
            </Text>
            <Badge variant="outline">{isAuthed ? "auth" : "guest"}</Badge>
          </Group>

          <Divider />

          <ScrollArea style={{ flex: 1 }} type="hover">
            <Stack gap={6}>
              {/* Protected pages */}
              <NavLink
                label="Dashboard"
                leftSection={<IconLayoutDashboard size={18} />}
                active={activePage === "dashboard"}
                disabled={!isAuthed}
                onClick={() => setPage("dashboard")}
              />

              <NavLink
                label="Projects"
                leftSection={<IconFolder size={18} />}
                active={activePage === "projects"}
                disabled={!isAuthed}
                onClick={() => setPage("projects")}
              />

              <NavLink
                label="Tasks"
                leftSection={<IconChecklist size={18} />}
                active={activePage === "tasks"}
                disabled={!isAuthed}
                onClick={() => setPage("tasks")}
              />

              <NavLink
                label="Settings"
                leftSection={<IconSettings size={18} />}
                active={activePage === "settings"}
                disabled={!isAuthed}
                onClick={() => setPage("settings")}
              />

              <Divider my="sm" label="Auth" labelPosition="center" />

              {/* Public pages */}
              <NavLink
                label="Login"
                leftSection={<IconLogin size={18} />}
                active={activePage === "login"}
                onClick={() => setPage("login")}
              />

              <NavLink
                label="Register"
                leftSection={<IconUserPlus size={18} />}
                active={activePage === "register"}
                onClick={() => setPage("register")}
              />
            </Stack>
          </ScrollArea>

          {/* Widget progress */}
          {isAuthed ? (
            <Card withBorder radius="md" p="md">
              <Text fw={700} mb={6}>
                Progress
              </Text>
              <Text c="dimmed" size="sm">
                Done: {stats.donePct}%
              </Text>
              <Progress value={stats.donePct} mt="sm" />
            </Card>
          ) : (
            <Card withBorder radius="md" p="md">
              <Text fw={700} mb={6}>
                Guest mode
              </Text>
              <Text c="dimmed" size="sm">
                Please login to access Dashboard, Projects and Tasks.
              </Text>
            </Card>
          )}
        </Stack>
      </AppShell.Navbar>

      {/* MAIN */}
      <AppShell.Main>
        <Group justify="space-between" mb="lg">
          <Title order={2}>{pageTitle}</Title>
        </Group>

        {/* Guard rendering */}
        {shouldShowLoginInstead ? (
          <Login />
        ) : (
          <>
            {activePage === "dashboard" && <Dashboard />}
            {activePage === "projects" && <Projects />}
            {activePage === "tasks" && <Tasks />}
            {activePage === "settings" && <Settings />}
            {activePage === "login" && <Login />}
            {activePage === "register" && <Register />}
          </>
        )}
      </AppShell.Main>
    </AppShell>
  );
}
