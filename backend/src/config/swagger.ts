import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scalable REST API with Authentication & Role-Based Access',
      version: '1.0.0',
      description:
        'A professional-grade backend REST API showing modular project structure, custom logging, robust JWT authentication, fine-grained role authorization, database migrations with Prisma, and interactive Swagger API documentation.',
    },
    servers: [
      {
        url: '/api/v1',
        description: 'V1 API Server Gateway',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token to authorize requests.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['USER', 'ADMIN'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
            userId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'dev@example.com' },
            password: { type: 'string', minLength: 6, example: 'password123' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'dev@example.com' },
            password: { type: 'string', example: 'password123' },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Design scalable API structure' },
            description: { type: 'string', example: 'Create modular component design docs', nullable: true },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'TODO' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH' },
          },
        },
        TaskUpdateInput: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Design scalable API structure' },
            description: { type: 'string', example: 'Create modular component design docs', nullable: true },
            status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'], example: 'IN_PROGRESS' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], example: 'HIGH' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Creates a new user account with hashed password and returns access JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered and authenticated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation failed or email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate a user',
          description: 'Verifies email and password credentials, returning user profile and access JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Successful authentication',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          token: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Invalid login credentials' },
          },
        },
      },
      '/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Retrieve tasks',
          description: 'Returns all tasks. Regular users retrieve only their owned tasks. Admin users retrieve all tasks across the system.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Successful retrieval of task array',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Task' },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or expired Bearer Token' },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          description: 'Creates a task linked to the authenticated user context',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Task successfully created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: { description: 'Missing title or malformed payload values' },
            401: { description: 'Missing or expired Bearer Token' },
          },
        },
      },
      '/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Retrieve single task details',
          description: 'Returns the specified task. Ownership checked: Regular users can only fetch owned tasks. Admins can fetch any task.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'The Task ID',
            },
          ],
          responses: {
            200: {
              description: 'Task details retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden access to another user task' },
            404: { description: 'Task matching ID not found' },
          },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update task properties',
          description: 'Updates task values. Regular users can only update owned tasks. Admins can update any task.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'The Task ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskUpdateInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Task updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Task' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden access to update another user task' },
            404: { description: 'Task not found' },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Remove a task',
          description: 'Permanently deletes a task. Regular users can only delete owned tasks. Admins can delete any task.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'The Task ID',
            },
          ],
          responses: {
            200: {
              description: 'Task deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: {
                        type: 'object',
                        properties: { id: { type: 'string', format: 'uuid' } },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden access to delete another user task' },
            404: { description: 'Task not found' },
          },
        },
      },
    },
  },
  apis: [], // Self-contained path mapping avoids regex checks
};

export const swaggerSpec = swaggerJSDoc(options);
export { default as swaggerUi } from 'swagger-ui-express';
