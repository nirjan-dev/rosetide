import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL!;
export default defineConfig({
  out: './migrations',
  schema: './src/lib/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url,
  },
});
