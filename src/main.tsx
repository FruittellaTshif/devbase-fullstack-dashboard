import React from "react";
import ReactDOM from "react-dom/client";

/**
 * Styles Mantine (obligatoires)
 */
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import App from "./App";
import { getTheme, onThemeChange, type ThemeName } from "./lib/theme";

function Root() {
  // ✅ Theme initial depuis localStorage (ou fallback)
  const [scheme, setScheme] = React.useState<ThemeName>(() => getTheme());

  // ✅ Mise à jour instantanée via event custom (pas besoin de refresh)
  React.useEffect(() => {
    const off = onThemeChange(setScheme);
    return off;
  }, []);

  return (
    <MantineProvider
      key={scheme}
      defaultColorScheme={scheme}
      theme={{
        primaryColor: "blue",
        defaultRadius: "md",
      }}
    >
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  );
}

export default Root;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
