import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { v4 as uuidv4 } from 'uuid';

import { redis } from './redis';
import { AppError } from '../app-error';
import { ERRORS } from '../../constants/errors';

/**
 * Environment validation
 */
const requiredEnv = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} is not defined`);
  }
}

/**
 * Config
 */
const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

const ISSUER = process.env.JWT_ISSUER ?? 'your-app-name.com';
const AUDIENCE = process.env.JWT_AUDIENCE ?? 'your-app-client';

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL ?? '7d';

/**
 * Token payload
 */
interface CustomPayload extends JWTPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Shared JWT builder
 */
const buildToken = (
  user: { id: string; email: string },
  type: 'access' | 'refresh',
  secret: Uint8Array,
  ttl: string
) => {
  const jti = uuidv4();

  return new SignJWT({
    sub: user.id,
    email: user.email,
    type,
  })
    .setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(jti)
    .setExpirationTime(ttl)
    .sign(secret);
};

/**
 * Generate tokens
 */
export const generateAccessToken = (user: { id: string; email: string }) => {
  return buildToken(user, 'access', JWT_ACCESS_SECRET, ACCESS_TOKEN_TTL);
};

export const generateRefreshToken = (user: { id: string; email: string }) => {
  return buildToken(user, 'refresh', JWT_REFRESH_SECRET, REFRESH_TOKEN_TTL);
};

/**
 * Shared verifier
 */
const verifyToken = async (
  token: string,
  expectedType: 'access' | 'refresh',
  secret: Uint8Array
): Promise<CustomPayload> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: '5s',
    });

    if (payload.type !== expectedType) {
      throw new AppError(ERRORS.TOKEN_TYPE_MISMATCH);
    }

    if (!payload.jti) {
      throw new AppError(ERRORS.INVALID_TOKEN);
    }

    return payload as CustomPayload;
  } catch (err: any) {
    if (err?.code === 'ERR_JWT_EXPIRED') {
      throw new AppError(ERRORS.TOKEN_EXPIRED);
    }

    throw new AppError(ERRORS.INVALID_TOKEN);
  }
};

/**
 * Access token verification
 */
export const verifyAccessToken = async (
  token: string
): Promise<CustomPayload> => {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      clockTolerance: '5s',
    });

    if (payload.type !== 'access') {
      throw new AppError(ERRORS.TOKEN_TYPE_MISMATCH);
    }

    if (!payload.jti) {
      throw new AppError(ERRORS.INVALID_TOKEN);
    }

    const isRevoked = await redis.exists(`blacklist:${payload.jti}`);

    if (isRevoked) {
      throw new AppError(ERRORS.TOKEN_REVOKED);
    }

    return payload as CustomPayload;
  } catch (err: any) {
    if (err?.code === 'ERR_JWT_EXPIRED') {
      throw new AppError(ERRORS.TOKEN_EXPIRED);
    }

    if (err instanceof AppError) throw err;

    throw new AppError(ERRORS.INVALID_TOKEN);
  }
};

/**
 * Refresh token verification
 */
export const verifyRefreshToken = (token: string) => {
  return verifyToken(token, 'refresh', JWT_REFRESH_SECRET);
};
