function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  console.warn('⚠️  JWT_SECRET not set — using dev-only default. Set JWT_SECRET in .env for production.');
  return 'oxygen-gym-dev-secret-change-me';
}

export const JWT_SECRET = resolveJwtSecret();

export const STAFF_ROLES = new Set(['admin', 'trainer']);
