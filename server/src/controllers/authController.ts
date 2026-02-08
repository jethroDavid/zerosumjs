import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';
import { User, type IUser } from '../models/user';
import { config } from '../config/env';

type TokenPayload = JwtPayload & { sub: string; email: string };

const createError = (status: number, message: string): Error & { status?: number } => {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
};

const createToken = (user: IUser): string =>
  jwt.sign(
    { sub: user._id, email: user.email }, 
    config.jwtSecret, 
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      throw createError(400, 'Username, email, and password are required');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      throw createError(409, 'Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });
    const token = createToken(user);

    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      throw createError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      throw createError(401, 'Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw createError(401, 'Invalid credentials');
    }

    const token = createToken(user);
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const oauthUser = req.user as IUser | undefined;
  if (!oauthUser) {
    res.redirect(`${config.clientOrigin}/auth/callback?error=missing-user`);
    return;
  }

  const token = createToken(oauthUser);
  const redirectUrl = `${config.clientOrigin}/auth/callback?token=${token}`;
  res.redirect(redirectUrl);
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('username email');
    if (!user) {
      throw createError(404, 'User not found');
    }

    res.json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    next(error);
  }
};
