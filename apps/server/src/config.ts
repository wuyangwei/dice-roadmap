import path from 'node:path';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  webPort: Number(process.env.WEB_PORT ?? 5173),
  host: process.env.HOST ?? '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET ?? 'local-dev-secret-change-before-production',
  dataDir: process.env.DATA_DIR ?? path.resolve(process.cwd(), '../../data'),
  operatorPin: process.env.OPERATOR_PIN ?? '123456',
  adminPin: process.env.ADMIN_PIN ?? '888888'
};
