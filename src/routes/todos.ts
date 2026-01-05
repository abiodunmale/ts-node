import { Router } from "express";
import { protect } from '../middleware/auth';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
} from "../controllers/todoController";
import { validate } from '../middleware/validate';
import { createTodoSchema, updateTodoSchema } from '../validation/schemas';

const router = Router();

router.use(protect);

router.get("/", getTodos);
router.post("/", validate(createTodoSchema), createTodo);
router.put("/:id", validate(updateTodoSchema), updateTodo);
router.delete("/:id", deleteTodo);
router.get("/:id", getTodoById);

export default router;
