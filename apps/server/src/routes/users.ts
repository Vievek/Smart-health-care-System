import { Router } from "express";
import { UserService } from "../services/UserService.js";
import { authenticate } from "../middleware/auth.js";
import bcrypt from "bcryptjs";

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
router.post("/", authenticate, async (req, res) => {
  try {
    // Only admins can create staff/doctors
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Only administrators can create staff accounts" });
    }

    const userData = req.body;
    
    if (!userData.password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Use the userService to create the user with default active status
    const user = await userService.create({
      ...userData,
      status: "active",
      passwordHash: await bcrypt.hash(userData.password, 12)
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create staff account", details: error.message });
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
