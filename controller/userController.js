const userModel = require('../model/userModel')

// REGISTER A NEW USER 
const Registeruser = async (req,res) =>{
    try {
        const { fullname,email,password} = req.body;
       const matchUser =  await userModel.findOne({fullname:fullname,email:email})
       
       if(matchUser){
        res.status(500).json({err:"user already exists"})

       }else{
        const newUser = new userModel({
            fullname,
            email,
            password,
        })
        await newUser.save()
        res.status(200).json(newUser)
       }
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }

}
///// LOGIN A USER
const loginUser = async(req,res) =>{
    const { email, password } = req.body;
    try {
        const matchUser = await userModel.findOne({email:email})
        if(matchUser){
            if(password === matchUser.password){
                res.status(200).json({matchUser})
            }else{
                res.status(401).json({message:"wrong password"})
            }
        }else{
            res.status(401).json({message:"User not exist"})
            
        }

    } catch (error) {
        res.status(500).json({message: error.message})
            
    }

}
const allUser = async(req,res) =>{
    const _id = req.params.id;
    try {
        const alluser = await userModel.find({_id:{$ne : _id}})
        res.status(200).json(alluser)
        
    } catch (error) {
        res.status(500).json({message: error.message})

    }
}
module.exports = {Registeruser,loginUser,allUser}