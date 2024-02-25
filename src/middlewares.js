import {User} from './models/user.model.js'





const isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        return res.redirect("/signup/signin")
    } 
    next();
}

const isAgent = async (req,res,next) => {
    if(req.user){
        let user = await User.findById(req.user._id);
        if(user && user.isAgent == true) {
            next();
        }
        else{
            res.send("you dont have access to this page");
        }
    }
}

export {isLoggedIn , isAgent };