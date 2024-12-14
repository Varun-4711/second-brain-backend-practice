import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const middlewareAuth = (req: Request, res: Response, next: NextFunction):any => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send("Authorization header missing");
    }

    const token = authHeader;
    const secretKey = process.env.SECRET_KEY as string;

    // Verifing the token
    const decoded = jwt.verify(token, secretKey) as { id: string; username: string };

    // Setting user info in request object
    //@ts-ignore
    req.id = decoded.id;
    //@ts-ignore
    req.username = decoded.username;

    next(); // Proceeding to the next middleware
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).send("Invalid or expired token");
  }
};

export default middlewareAuth;
