import { Request, Response } from 'express';
import Todo, { ITodo } from '../models/Todo';
import { CreateTodoInput, UpdateTodoInput } from '../validation/schemas';
import redisClient from '../utils/redis';
import logger from '../utils/logger';

interface CreateTodoBody {
    title: string;
}

interface UpdateTodoBody {
    title?: string;
    completed?: boolean;
}

export const getTodos = async (req: Request, res: Response) : Promise<void> => {
    const cacheKey = `todos:user:${req.user!.id}`;

    let page = Number(req.query.page) || 1; // Default page 1
    let limit = Number(req.query.limit) || 10; // Default 10 items per page

    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10; // Max 100 to prevent abuse

    const skip = (page - 1) * limit; // Calculate how many to skip (e.g., page 2 skips first 10)

    try {
        const paginatedCacheKey = `${cacheKey}:page:${page}:limit:${limit}`;
        const cachedData = await redisClient.get(paginatedCacheKey);

        if (cachedData) {
            logger.debug(`Cache HIT for ${paginatedCacheKey}`);
            res.status(200).json(JSON.parse(cachedData));
            return;
        }

        const todosQuery = Todo.find({ user: req.user!.id }).sort({ createdAt: -1 });
        const todos = await todosQuery.skip(skip).limit(limit).exec(); // Apply skip/limit

        const totalTodos = await Todo.countDocuments({ user: req.user!.id });
        const totalPages = Math.ceil(totalTodos / limit);

        const response = {
            todos,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalTodos,
                itemsPerPage: limit,
            },
        };

        res.status(200).json(response);

        // Cache the full response
        await redisClient.setEx(paginatedCacheKey, 300, JSON.stringify(response));
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};


export const createTodo = async (req: Request<{}, {}, CreateTodoInput>, res: Response) : Promise<void> => {
    const { title } = req.body;

    if (!title) {
        res.status(400).json({ message: 'Title is required' });
        return;
    }

    try {
        const newTodo: ITodo = new Todo({
            title,
            user: req.user!.id, // Attach owner
        });
        await newTodo.save();

        const cacheKey = `todos:user:${req.user!.id}`;
        await redisClient.del(cacheKey);
        logger.debug('Cache invalidated – will refresh on next request');
         
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
}

export const updateTodo = async (req: Request<{id: string}, {} , UpdateTodoInput>, res: Response) : Promise<void> => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedTodo: ITodo | null = await Todo.findOneAndUpdate(
            { _id: id, user: req.user!.id },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            res.status(404).json({ message: 'Todo not found' });
            return;
        }

        const cacheKey = `todos:user:${req.user!.id}`;
        await redisClient.del(cacheKey);
        logger.debug('Cache invalidated – will refresh on next request');

        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
}


export const deleteTodo = async (req: Request<{id: string}>, res: Response) : Promise<void> => {
    const { id } = req.params;
    try {
        const deletedTodo: ITodo | null = await Todo.findOneAndDelete({
            _id: id,
            user: req.user!.id,
        });

        if (!deletedTodo) {
            res.status(404).json({ message: 'Todo not found' });
            return;
        }

        const cacheKey = `todos:user:${req.user!.id}`;
        await redisClient.del(cacheKey);
        logger.debug('Cache invalidated – will refresh on next request');

        res.status(204).send();  // No content
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

// GET /api/todos/:id - Get single todo
export const getTodoById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {

    const todo: ITodo | null = await Todo.findOne({
      _id: id,
      user: req.user!.id, // Must belong to user
    });

    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }

    res.status(200).json(todo);
  } catch (error) {
    if ((error as any).name === 'CastError') {
      res.status(400).json({ message: 'Invalid Todo ID format' });
      return;
    }
    res.status(500).json({ message: (error as Error).message });
  }
};