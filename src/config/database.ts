import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://noted_user:noted_password@localhost:5432/noted_db';

export const sql = postgres(databaseUrl, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;