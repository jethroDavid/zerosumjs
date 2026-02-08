import { type Request, type Response, type NextFunction } from 'express';
import { Todo } from '../models/todo';

export const listTodos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ todos });
  } catch (error) {
    next(error);
  }
};

export const createTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title } = req.body as { title?: string };
    if (!title) {
      res.status(400).json({ message: 'Title is required' });
      return;
    }

    const todo = await Todo.create({ userId: req.userId, title });
    res.status(201).json({ todo });
  } catch (error) {
    next(error);
  }
};

export const updateTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, completed } = req.body as { title?: string; completed?: boolean };
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, completed },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }

    res.json({ todo });
  } catch (error) {
    next(error);
  }
};

export const deleteTodo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!todo) {
      res.status(404).json({ message: 'Todo not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
