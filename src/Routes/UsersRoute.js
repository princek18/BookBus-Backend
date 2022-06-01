const {Router} = require("express");
const UsersModel = require("../Models/UsersModel");
const { authUser, getAuthToken, authToken, getAdminAuthToken, getResetPasswordToken, sendResetEmail } = require("../utils/utils");

const userRouter = new Router();

userRouter.post('/signup', async (req, res) => {
    try{
        let data = await UsersModel.findOne({email: req.body.email});
        if (data?.email) {
            return res.status(400).send({message: "Email Id already registered!"})
        }
        const user = new UsersModel(req.body);
        await user.save();
        res.send({message: "User Successfully Created!"})
    }catch(e){
        res.status(400).send({message: e.message})
    }
});

userRouter.post('/login', async (req, res) => {
    if(!req.body?.email || !req.body?.password){
        return res.status(404).send({message: "Please provide email and password."})
    }
    try{
        let authToken;
        const user = await authUser(req.body.email, req.body.password, req.body.userType);
        if (req.body.userType === "Admin") {
            authToken = await getAdminAuthToken(user);
        }
        else {
        authToken = await getAuthToken(user);
        }
        res.send({user, authToken});
    }catch(e){
        res.status(400).send({message: e.message});
    }
})

userRouter.post('/resetpassword', async (req, res) => {
    if(!req.body?.email){
        return res.status(404).send({message: "Please provide email!"})
    }
    try{
        const user = await UsersModel.findOne({email: req.body.email});
        if (!user) {
            return res.status(404).send({message: "Email not found!"});
        }
        const email = user.email;
        const token = await getResetPasswordToken(user);
        let data = await sendResetEmail(email, token);
        if (!data) {
        res.status(400).send({message: "Error Occured!"});
        }
        res.send({message: "Check Email for Reset Password Link!"})
    }
    catch(e){
        res.status(400).send({message: e.message});
    }
});

userRouter.post('/resetpasswordset', async (req, res) => {
    if(!req.body?.userId || !req.body?.password){
        return res.status(404).send({message: "Please provide correct data!"})
    }
    try{
        const user = await UsersModel.findOne({_id: req.body.userId});
        if (!user) {
            return res.status(404).send({message: "Invalid user!"});
        }
        user.password = req.body.password;
        await user.save();
        res.send({message: "Password changed successfully!"});
    }
    catch(e){
        res.status(400).send({message: e.message});
    }
})

userRouter.get('/getwallet', authToken, async (req, res) => {
    try{
        let user = await UsersModel.findOne({_id: req.user._id});
        if (!user) {
            return res.status(404).send({message: "User not found!"});
        }
        res.status(200).send({walletBalance :user.wallet});
    }
    catch(e){
        res.status(400).send({message: e.message});
    }
})

userRouter.put('/addMoney', authToken, async (req, res) => {
    try{
        let user = await UsersModel.findOne({_id: req.user._id});
        const userD = await authUser(user.email, req.body.password, user.userType);

        userD.wallet += Number(req.body.money);
        await userD.save();
        res.send({message: `₹${req.body.money} added successfully!`, money: userD.wallet})
    }
    catch(e){
        res.status(400).send({message: e.message});
    }
})

userRouter.get('/getprofile', authToken, async (req, res) => {
    try{
        let user = await UsersModel.findOne({_id: req.user._id});
        if (!user) {
            return res.status(404).send({message: "User not found!"});
        }
        res.status(200).send({user});
    }
    catch(e){
        res.status(400).send({message: e.message});
    }
})

userRouter.put('/updateprofile', authToken, async (req, res) => {
    try{
        let user = await UsersModel.findOne({_id: req.user._id});
        const userD = await authUser(user.email, req.body.password, user.userType);
        if (req.body.email.length > 5) {
            userD.email = req.body.email
        }
        if (req.body.firstName.length > 3) {
            userD.firstName = req.body.firstName
        }
        if (req.body.lastName.length > 3) {
            userD.lastName = req.body.lastName
        }
        if (req.body.mobile.length === 10) {
            userD.mobile = req.body.mobile
        }
        if (req.body.npassword && req.body.npassword.length > 6) {
            userD.password = req.body.npassword
        }
        await userD.save();
        res.send({message: "Profile successfully updated!", user: userD})
    }
    catch(e){
        res.status(400).send({message: e.message});
    }
})

module.exports = userRouter;