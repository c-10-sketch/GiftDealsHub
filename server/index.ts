import { createServer } from "http";
import { createApp, log } from "./app";

async function start() {
  const httpServer = createServer();

  try {
    const app = await createApp({
      httpServer,
      enableStatic: process.env.NODE_ENV === "production",
      enableVite: process.env.NODE_ENV !== "production",
    });

    httpServer.on("request", app);
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
}

start();
