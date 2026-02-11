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
 * Page Register (production-ready)
 * - POST /api/auth/register
 * - Le backend renvoie { accessToken, user }
 * - On connecte automatiquement l'utilisateur (via authService.register)
 */
export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // Validation légère (le backend fait la vraie validation)
  const canSubmit = email.trim().length > 3 && password.trim().length >= 6;

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!canSubmit || loading) return;

    setLoading(true);
    try {
      const res = await authService.register({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });

      notifications.show({
        title: "Account created",
        message: `Welcome ${res.user.name}!`,
        color: "green",
      });

      // App.tsx écoute "auth:changed" et redirige vers Dashboard automatiquement.
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register failed";
      notifications.show({
        title: "Register failed",
        message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card withBorder radius="lg" p="xl" maw={420}>
      <form onSubmit={onSubmit}>
        <Stack>
          <Title order={3}>Create account</Title>
          <Text c="dimmed" size="sm">
            Create your account to access the dashboard.
          </Text>

          <TextInput
            label="Name (optional)"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="name"
          />

          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            autoComplete="email"
          />

          <PasswordInput
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth disabled={!canSubmit || loading}>
            {loading ? <Loader size="xs" /> : "Sign up"}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
