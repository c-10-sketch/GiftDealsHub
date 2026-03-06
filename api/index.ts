import { createApp } from "../server/app";

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel handler initialization failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
