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
  console.log("🔥 CLICK SIGN IN");
  console.log("canSubmit:", canSubmit);
  console.log("email:", email);

  if (!canSubmit) {
    console.log("❌ Form invalid — submit blocked");
    return;
  }

  setLoading(true);

  try {
    console.log("🚀 Sending login request...");

    const res = await authService.login({ email, password });

    console.log("✅ Login success:", res);

    notifications.show({
      title: "Logged in",
      message: `Welcome ${res.user.name}!`,
      color: "green",
    });
  } catch (e) {
    console.error("💥 Login error:", e);

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
