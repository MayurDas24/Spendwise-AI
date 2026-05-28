import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../db.js";
import { defaultCategories } from "../utils/defaultCategories.js";

// Generate JWT Token
const signToken = (userId) =>
  jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// ================= REGISTER =================
export const register = async (req, res) => {
  const {
    name,
    email,
    password,
    currency = "USD",
  } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  const client = await pool.connect();

  try {
    // Check Existing User
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Start Transaction
    await client.query("BEGIN");

    // Hash Password
    const salt = await bcrypt.genSalt(10);

    const passwordHash = await bcrypt.hash(
      password,
      salt
    );

    // Create User
    const userResult = await client.query(
      `
      INSERT INTO users
      (name, email, password_hash, currency)

      VALUES ($1, $2, $3, $4)

      RETURNING
      id,
      name,
      email,
      currency,
      created_at
      `,
      [
        name,
        email,
        passwordHash,
        currency,
      ]
    );

    const user = userResult.rows[0];

    // Seed Default Categories
    for (const cat of defaultCategories) {
      await client.query(
        `
        INSERT INTO categories
        (user_id, name, type, icon, color, is_default)

        VALUES ($1, $2, $3, $4, $5, true)
        `,
        [
          user.id,
          cat.name,
          cat.type,
          cat.icon,
          cat.color,
        ]
      );
    }

    // Commit Transaction
    await client.query("COMMIT");

    // Generate Token
    const token = signToken(user.id);

    res.status(201).json({
      user,
      token,
    });

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback failed:", rollbackError);
    }

    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error",
    });

  } finally {

    client.release();

  }
};

// ================= LOGIN =================
export const login = async (req, res) => {

  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {

    // Find User
    const result = await pool.query(
      `
      SELECT
      id,
      name,
      email,
      password_hash,
      currency

      FROM users

      WHERE email = $1
      `,
      [email]
    );

    // User Not Found
    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    // Compare Password
    const match = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // Generate Token
    const token = signToken(user.id);

    // Send Response
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
      token,
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });

  }
};

// ================= GET CURRENT USER =================
export const getMe = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
      id,
      name,
      email,
      currency,
      created_at

      FROM users

      WHERE id = $1
      `,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error("GetMe error:", error);

    res.status(500).json({
      message: "Server error",
    });

  }
};