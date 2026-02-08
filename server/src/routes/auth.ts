import { Router } from 'express';
import { passport } from '../config/passport';
import { register, login, googleCallback, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  googleCallback
);

router.get('/me', authenticate, me);

export default router;
