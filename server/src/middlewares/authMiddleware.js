import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const protect = async(req, res, next)=>{
  try{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer")){
       return res.status(401).json({message: "Not authorized, no token"});

    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "secret";
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id).select("-password");

    next();

  }catch(error){
    console.log("JWT ERROR:", error.message);
     return res.status(401).json({message: "Not authorized , token failed"});
  }
};