import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import todoRoutes from './routes/todos';
import authRoutes from './routes/auth';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use('/api/todos', todoRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Todo API with TypeScript is running!');
});


const PORT: number = Number(process.env.PORT) || 5000;

mongoose.connect(process.env.MONGO_URI as string)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err: Error) => console.log(err));

export default app;  // Add at bottom