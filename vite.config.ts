import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");
  const assetRoot = env.VITE_ASSET_ROOT;
  const port = Number(env.UI_PORT);

  return {
    base: `${assetRoot}/`,
    plugins: [react()],
    server: {
      host: true,
      port,
    },
  };
});
