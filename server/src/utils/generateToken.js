import jwt from "jsonwebtoken";

const generateToken = (id) =>{
     const jwtSecret = process.env.JWT_SECRET || "secret";
     return jwt.sign({id} , jwtSecret , {expiresIn: "30d"});


};

export default generateToken;