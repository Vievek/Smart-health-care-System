import { Router } from "express";
import { UserService } from "../services/UserService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const userService = new UserService();

router.get("/", authenticate, async (_req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export { router as userRoutes };
