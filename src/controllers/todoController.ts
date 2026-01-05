import { Request, Response } from 'express';
import Todo, { ITodo } from '../models/Todo';
import { CreateTodoInput, UpdateTodoInput } from '../validation/schemas';


interface CreateTodoBody {
    title: string;
}

interface UpdateTodoBody {
    title?: string;
    completed?: boolean;
}

export const getTodos = async (req: Request, res: Response) : Promise<void> => {
    try {
        const todos : ITodo[] = await Todo.find({ user: req.user!.id });
        res.status(200).json(todos);
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