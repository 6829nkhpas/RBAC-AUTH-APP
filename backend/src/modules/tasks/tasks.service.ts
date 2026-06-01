import { prisma } from '../../config/db';
import { NotFoundError, ForbiddenError } from '../../utils/apiResponse';
import { AuthUser } from '../../types';

export class TasksService {
  static async createTask(userId: string, body: any) {
    const { title, description, status, priority } = body;

    return await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        userId,
      },
    });
  }

  static async getAllTasks(user: AuthUser) {
    if (user.role === 'ADMIN') {
      // Admins can see all tasks, along with the email/role of the task owner
      return await prisma.task.findMany({
        include: {
          user: {
            select: {
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Regular users see only their own tasks
    return await prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTaskById(taskId: string, user: AuthUser) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // RBAC: Assert that only the task owner or an ADMIN can view the task details
    if (task.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view this task');
    }

    return task;
  }

  static async updateTask(taskId: string, user: AuthUser, body: any) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // RBAC: Assert that only the task owner or an ADMIN can update the task
    if (task.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to modify this task');
    }

    const { title, description, status, priority } = body;

    return await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
      },
    });
  }

  static async deleteTask(taskId: string, user: AuthUser) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // RBAC: Assert that only the task owner or an ADMIN can delete the task
    if (task.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this task');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { id: taskId };
  }
}
