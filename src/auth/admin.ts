import "express";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

const validateAdminToken = expressAsyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // const token = req.cookies.adminjwt;

  if (!token) {
    return res.json({ message: "No token provided" }).status(401);
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    req.user = decodedToken.user;
    next();
  } catch (error) {
    res.json({ message: "Invalid token" }).status(401);
  }
});

export default validateAdminToken;
