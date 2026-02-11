import { useState } from "react";
import {
  Card,
  Stack,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { authService } from "../services/auth.service";

/**
 * Login connecté au backend (POST /api/auth/login)
 * - Stocke accessToken + user
 * - App déclenche "auth:changed"
 */
export default function Login() {
  const [email, setEmail] = useState("postman1@test.com");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 3 && password.trim().length >= 6;

  async function onSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await authService.login({ email, password });

      notifications.show({
        title: "Logged in",
        message: `Welcome ${res.user.name}!`,
        color: "green",
      });

      // Option simple : redirige "logiquement" vers le dashboard
      // (App.tsx va voir l'event auth:changed et afficher Dashboard)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      notifications.show({
        title: "Login failed",
        message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card withBorder radius="lg" p="xl" maw={420}>
      <Stack>
        <Title order={3}>Login</Title>
        <Text c="dimmed" size="sm">
          Sign in to access Dashboard / Projects / Tasks.
        </Text>

        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          required
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          required
        />

        <Button fullWidth onClick={onSubmit} disabled={!canSubmit || loading}>
          {loading ? <Loader size="xs" /> : "Sign in"}
        </Button>
      </Stack>
    </Card>
  );
}
