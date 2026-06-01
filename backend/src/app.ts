import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/apiResponse';

// Import Route modules
import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/tasks.routes';

// Import Swagger specifications
import { swaggerSpec, swaggerUi } from './config/swagger';

const app = express();

// 1. Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all for demo purposes, can configure to frontend specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. Rate Limiting to prevent brute-force/DDoS (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// 3. Request Parsing
app.use(express.json());

// 4. Request Logging (Morgan stream integrated with Winston Logger)
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};
app.use(morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// 5. Active API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// 6. Interactive Swagger Documentation UI
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 7. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// 8. 404 Unmapped Route Handler
app.use('*', (req, res, next) => {
  next(new NotFoundError(`Cannot ${req.method} on specified path: ${req.originalUrl}`));
});

// 9. Global Centralized Error Handler
app.use(errorHandler);

export default app;
