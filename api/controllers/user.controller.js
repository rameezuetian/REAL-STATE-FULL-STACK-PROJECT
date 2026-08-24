import User from '../models/user.model.js';
import {errorHandler} from '../utils/error.js';
import Listing from '../models/listing.model.js';
import bcrypt from 'bcryptjs';


export const test = (req  , res) =>{
    res.json({
        message:'API route is working'
    });
};



export const updateUser = async (req, res, next) => {
  console.log("BODY:", req.body);
  console.log("PARAM ID:", req.params.id);

  if (req.body.id !== req.params.id) {
    return next(
      errorHandler(401, "You can only update your own account!")
    );
  }

  try {
    const updateFields = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    if (req.body.password && req.body.password.trim() !== "") {
      updateFields.password = bcryptjs.hashSync(
        req.body.password,
        10
      );
    }

    console.log("UPDATE FIELDS:", updateFields);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: updateFields,
      },
      {
        returnDocument: "after",
      }
    );

    console.log("UPDATED USER:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password, ...rest } = updatedUser._doc;

    return res.status(200).json(rest);

  } catch (error) {
    console.log("🔥 UPDATE USER ERROR:", error);
    next(error);
  }
};


export const deleteUser = async (req , res , next)=>{

    if(req.user.id !==  req.params.id) return next(errorHandler(401 , 'You can only delete your own account!'))
    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie('access_token');
        res.status(200).json("User has been deleted!");
    } catch (error) {
        next(error)
    }
}


export const getUserListing = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listing = await Listing.find({
        userRef: req.params.id,
      });

      res.status(200).json(listing);
    } catch (error) {
      next(error);
    }
  } else {
    return next(
      errorHandler(401, "You can only view your own listings")
    );
  }
};


export const getUser = async (req , res , next)=>{
  try {
    const user = await User.findById(req.params.id);

  if(!user) return next(errorHandler(404 , 'User not found!'));

  const {password:pass , ...rest} = user._doc;

  res.status(200).json(rest);
    
  } catch (error) {
    next(error)
  }
}