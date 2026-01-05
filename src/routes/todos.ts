import { Router } from "express";
import { protect } from '../middleware/auth';
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoById,
} from "../controllers/todoController";

const router = Router();

router.use(protect);

router.get("/", getTodos);
router.post("/", createTodo);
router.put("/:id", updateTodo);
router.delete("/:id", deleteTodo);
router.get("/:id", getTodoById);

export default router;
