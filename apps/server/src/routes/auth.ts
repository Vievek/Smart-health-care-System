import { Router } from "express";
import { UserService } from "../services/UserService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole } from "@shared/healthcare-types";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { nationalId, password } = req.body;

    if (!nationalId || !password) {
      return res
        .status(400)
        .json({ error: "National ID and password are required" });
    }

    const userService = new UserService();
    const user = await userService.validateCredentials(nationalId, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        nationalId: user.nationalId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const {
      nationalId,
      email,
      phone,
      firstName,
      lastName,
      password,
      address,
      role = UserRole.PATIENT, // Default to patient
      dateOfBirth,
      gender,
      emergencyContact,
      insuranceInfo,
      specialization,
      licenseNumber,
    } = req.body;

    console.log("Registration request:", { nationalId, email, role });

    // Validate required fields
    if (
      !nationalId ||
      !email ||
      !phone ||
      !firstName ||
      !lastName ||
      !password ||
      !address
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: nationalId, email, phone, firstName, lastName, password, address",
      });
    }

    const userService = new UserService();

    // Check if user already exists
    const existingByNationalId = await userService.findByNationalId(nationalId);
    if (existingByNationalId) {
      return res
        .status(400)
        .json({ error: "User with this National ID already exists" });
    }

    const existingByEmail = await userService.findByEmail(email);
    if (existingByEmail) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create base user data - use simple User model without discriminators for now
    const userData: any = {
      nationalId,
      email,
      phone,
      firstName,
      lastName,
      passwordHash: await bcrypt.hash(password, 12),
      address,
      role,
      status: "active",
    };

    // For now, store role-specific data in the base user model
    // We can refactor to use discriminators later
    if (role === UserRole.PATIENT) {
      if (!dateOfBirth || !gender || !emergencyContact) {
        return res.status(400).json({
          error:
            "Patient registration requires dateOfBirth, gender, and emergencyContact",
        });
      }
      userData.dateOfBirth = new Date(dateOfBirth);
      userData.gender = gender;
      userData.emergencyContact = emergencyContact;
      userData.insuranceInfo = insuranceInfo || "";
    } else if (role === UserRole.DOCTOR) {
      if (!specialization || !licenseNumber) {
        return res.status(400).json({
          error:
            "Doctor registration requires specialization and licenseNumber",
        });
      }
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
    }

    console.log("Creating user with data:", {
      ...userData,
      passwordHash: "***",
    });

    const user = await userService.create(userData);

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("User created successfully:", user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        nationalId: user.nationalId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration error details:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export { router as authRoutes };
