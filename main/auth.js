import jwt from "jsonwebtoken"
import { get_account } from "./database.js";

export async function authUser(req, res, next){
    const token = req.cookies.token ?? null;
    if (!token){
        req.user = null
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
        req.user = await get_account(decoded.id);
        
    } catch (err) {
        console.log(err)
        req.user = null;
        res.clearCookie("token")
    }

    next()
}

export function requireAuth(req, res, next){
    // console.log("Auth middleware user:", req.user);
    if (!req.user){
        return res.redirect("/user/login")
    }
    next()
}

export function requireNoAuth(req, res, next){
    if (req.user){
        return res.redirect("/")
    }

    next()
}