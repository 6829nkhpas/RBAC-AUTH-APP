import { Request, Response, NextFunction } from 'express';
import { TasksService } from './tasks.service';
import { ApiResponse, BadRequestError } from '../../utils/apiResponse';

export class TasksController {
  static async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User context missing');
      }
      const task = await TasksService.createTask(req.user.id, req.body);
      ApiResponse.success(res, task, 'Task created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User context missing');
      }
      const tasks = await TasksService.getAllTasks(req.user);
      ApiResponse.success(res, tasks, 'Tasks retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User context missing');
      }
      const task = await TasksService.getTaskById(req.params.id, req.user);
      ApiResponse.success(res, task, 'Task retrieved successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User context missing');
      }
      const task = await TasksService.updateTask(req.params.id, req.user, req.body);
      ApiResponse.success(res, task, 'Task updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new BadRequestError('User context missing');
      }
      const result = await TasksService.deleteTask(req.params.id, req.user);
      ApiResponse.success(res, result, 'Task deleted successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
