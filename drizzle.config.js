/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./utils/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",

  dbCredentials: {
    url: process.env.DATABASE_URL,
    connectionString: process.env.DATABASE_URL,
  },
};


