import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

let pool: pg.Pool;
let db: ReturnType<typeof drizzle>;

// Initialize PostgreSQL if DATABASE_URL is provided
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
} else {
  console.warn("DATABASE_URL not set. PostgreSQL features will be disabled.");
}

export { pool, db };

// MongoDB connection will be initialized separately
export let mongoDB: any = null;

export async function initializeMongoDB() {
  const { connectToMongoDB } = await import("./mongodb.js");
  mongoDB = await connectToMongoDB();
  return mongoDB;
}
