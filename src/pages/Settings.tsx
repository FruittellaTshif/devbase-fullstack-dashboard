import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Stack,
  Title,
  Text,
  Switch,
  Group,
  Button,
  Code,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLogout } from "@tabler/icons-react";

import { clearAccessToken, getAccessToken } from "../lib/api";
import {
  getTheme,
  setTheme,
  toggleTheme as toggleThemeValue,
  type ThemeName,
  THEME_STORAGE_KEY,
} from "../lib/theme";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "");

// prefs locales (demo)
const LS_EMAIL_NOTIF = "devbase_email_notifications";
const LS_TASK_REMINDERS = "devbase_task_reminders";

function readBool(key: string, fallback: boolean) {
  const v = localStorage.getItem(key);
  if (v === null) return fallback;
  return v === "true";
}

export default function Settings() {
  /**
   * ✅ Theme preference (source de vérité : theme.ts)
   * - getTheme() lit localStorage + fallback
   * - setTheme() persiste + déclenche l'event => update instantané
   */
  const [theme, setThemeState] = useState<ThemeName>(() => getTheme());

  // UI prefs (local only)
  const [emailNotif, setEmailNotif] = useState<boolean>(() =>
    readBool(LS_EMAIL_NOTIF, false),
  );
  const [taskReminders, setTaskReminders] = useState<boolean>(() =>
    readBool(LS_TASK_REMINDERS, false),
  );

  const isAuthenticated = useMemo(() => Boolean(getAccessToken()), []);

  // Persist prefs locales
  useEffect(() => {
    localStorage.setItem(LS_EMAIL_NOTIF, String(emailNotif));
  }, [emailNotif]);

  useEffect(() => {
    localStorage.setItem(LS_TASK_REMINDERS, String(taskReminders));
  }, [taskReminders]);

  function onToggleTheme() {
    const next = toggleThemeValue(theme);
    setTheme(next); // ✅ persist + event => thème change instantanément
    setThemeState(next); // ✅ UI switch se met à jour

    notifications.show({
      title: "Theme updated",
      message: `Theme saved in localStorage (${THEME_STORAGE_KEY}).`,
      color: "green",
    });
  }

  function logout() {
    clearAccessToken();
    notifications.show({
      title: "Logged out",
      message: "Session cleared.",
      color: "green",
    });
    window.location.href = "/login";
  }

  return (
    <Stack gap="lg">
      <Title order={2}>Settings</Title>

      {/* App / API info */}
      <Card withBorder radius="lg" p="lg">
        <Title order={4} mb="sm">
          App
        </Title>

        <Stack gap={8}>
          <Group justify="space-between">
            <Text c="dimmed">API Base URL</Text>
            <Code>{API_BASE_URL || "Not set"}</Code>
          </Group>

          <Group justify="space-between">
            <Text c="dimmed">Session</Text>
            <Text>{isAuthenticated ? "Authenticated" : "Not logged in"}</Text>
          </Group>

          <Divider my="sm" />

          <Group justify="flex-end">
            <Button
              color="red"
              leftSection={<IconLogout size={16} />}
              onClick={logout}
              disabled={!isAuthenticated}
            >
              Logout
            </Button>
          </Group>
        </Stack>
      </Card>

      {/* Appearance */}
      <Card withBorder radius="lg" p="lg">
        <Title order={4} mb="sm">
          Appearance
        </Title>

        <Group justify="space-between">
          <div>
            <Text>Light mode</Text>
            <Text c="dimmed" size="sm">
              Instant switch + persist ({THEME_STORAGE_KEY})
            </Text>
          </div>

          <Switch
            checked={theme === "light"}
            onChange={onToggleTheme}
            aria-label="Toggle light mode"
          />
        </Group>
      </Card>

      {/* Notifications (local-only demo) */}
      <Card withBorder radius="lg" p="lg">
        <Title order={4} mb="sm">
          Notifications
        </Title>

        <Stack gap="sm">
          <Group justify="space-between">
            <div>
              <Text>Email notifications</Text>
              <Text c="dimmed" size="sm">
                Local-only preference (demo)
              </Text>
            </div>
            <Switch
              checked={emailNotif}
              onChange={(e) => setEmailNotif(e.currentTarget.checked)}
            />
          </Group>

          <Group justify="space-between">
            <div>
              <Text>Task reminders</Text>
              <Text c="dimmed" size="sm">
                Local-only preference (demo)
              </Text>
            </div>
            <Switch
              checked={taskReminders}
              onChange={(e) => setTaskReminders(e.currentTarget.checked)}
            />
          </Group>
        </Stack>
      </Card>

      {/* Security */}
      <Card withBorder radius="lg" p="lg">
        <Title order={4} mb="sm">
          Security
        </Title>

        <Text c="dimmed" size="sm">
          Password change / sessions management / 2FA require backend endpoints
          (ex: /api/users/me).
        </Text>
      </Card>
    </Stack>
  );
}
