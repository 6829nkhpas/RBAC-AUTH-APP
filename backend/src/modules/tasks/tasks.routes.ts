import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authenticate } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';
import { createTaskSchema, updateTaskSchema } from './tasks.validation';

const router = Router();

// Apply auth middleware globally to all task operations
router.use(authenticate);

router.post('/', validateRequest(createTaskSchema), TasksController.createTask);
router.get('/', TasksController.getAllTasks);
router.get('/:id', TasksController.getTaskById);
router.put('/:id', validateRequest(updateTaskSchema), TasksController.updateTask);
router.delete('/:id', TasksController.deleteTask);

export default router;
