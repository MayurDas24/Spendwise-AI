import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {

  const authHeader = req.headers.authorization;

  // Check Token Exists
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }

  // Extract Token
  const token = authHeader.split(" ")[1];

  try {

    // Verify Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach User ID to Request
    req.userId = decoded.userId;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Not authorized, token failed",
    });

  }
};

export default protect;