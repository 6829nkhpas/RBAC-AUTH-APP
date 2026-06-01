import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/apiResponse';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Re-assign request components to their parsed, validated equivalents
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format issues neatly for validation error responses
        const issues = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'), // ignore first 'body', 'query', or 'params'
          message: err.message,
        }));
        next(new BadRequestError('Validation Failed', issues));
      } else {
        next(error);
      }
    }
  };
};
