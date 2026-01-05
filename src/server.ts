import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import todoRoutes from './routes/todos';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import pinoHttp from 'pino-http';
import logger from './utils/logger';
import { apiLimiter, authLimiter } from './middleware/rateLimit';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

app.use(
  pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400) return 'warn';
      if (res.statusCode >= 500 || err) return 'error';
      return 'info';
    },
  })
);

app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/auth', authLimiter, authRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send('Todo API with TypeScript is running!');
});
app.use(errorHandler);


const PORT: number = Number(process.env.PORT) || 5000;

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err: Error) => console.log(err));

export default app;  // Add at bottom