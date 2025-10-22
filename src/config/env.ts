export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://noted_user:noted_password@localhost:5432/noted_db',
} as const;