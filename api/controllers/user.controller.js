import User from '../models/user.model.js';
import {errorHandler} from '../utils/error.js';
import bcrypt from 'bcryptjs';


export const test = (req  , res) =>{
    res.json({
        message:'API route is working'
    });
};



export const updateUser = async (req , res , next)=>{

    console.log("JWT USER:", req.user);
  console.log("PARAM ID:", req.params.id);

    if(req.user.id !== req.params.id) return next(errorHandler(401 , "You can only update your own account!"))


    try {

        if(req.body.password){
            req.body.password = bcrypt.hashSync(req.body.password, 10)
        }
        const updateUser= await User.findByIdAndUpdate(
            req.params.id,
            {
                $set:{
                    username:req.body.username,
                    email:req.body.email,
                    password: req.body.password,
                    avatar:req.body.avatar
                },
            },
            {
                returnDocument:'after',
            }
        );

        if(!updateUser){
            return res.status(404).json({
                success:false,
                message:"User nor Found",
            });
        }
        const {password  , ...rest} = updateUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error)
        
    }

}