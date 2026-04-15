const user = require("../models/User");
const generateToken = require("../utils/generateToken");

//Register Authentication

const register = async (req, res) =>{
    const [username , email , password] = req.body;

    try{
        const userExist = await User.findOne({email});

        if(userExist){
            return res.status(400).json({message: "User already exist"});

        }
        const user = await User.create({username, email, password});
        const token = generateToken(user_.id);

        res.status(201).json({
            _id: user._id,
             username: user.username,
             email: user.email,
             token
        });
    }
     catch(error){
        res.status(500).json({message: error.message});
     }
};

//Login authentication 

const login = async(req , res)=>{
     const {email, password} = req.body;

     try{
        if(!email || !password){
            return res.status(400).json({message: "Pleas provde email and password"});
        }

        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(400).json({message: "invalid credintials"});
        }

         if(!isMatch){
            return res.status(400).json({message: "invalid credintials"});


         }
         res.status(200).json({
             success: true,
             message: "Login successful",
             token: generateToken(user._id),
             user:{
                _id : user._id,
                username: user.username,
                email: user.email,
             },

         });
         
     }catch(error){
        res.status(500).json({message: error.message});
     }
}

const getMe = async(req, res )=>{
     try{
        const user = await User.findById(req.user._id).select("-password");
         res.status(200).json({success: true, message: "user profile", user});
     } catch(error){
        res.status(500).json({message : "server error"});

     }
}

module.expots ={
    register, login , getMe
};
