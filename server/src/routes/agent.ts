import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { simpleAgent } from '../controllers/agentController';

const router = Router();

router.use(authenticate);

router.get('/', simpleAgent);

export default router;
