import express, { Router }  from "express";
import {fileURLToPath} from "url";
import path from "path";
import bcrypt from "bcrypt";
import {users} from "../server.js"
import jwt from "jsonwebtoken"
import { check_account, get_account, register_account, findByIdAndUpdate, is_current_order, add_to_cart, get_product_info, get_cart_products, get_cart_id, get_order_total, finish_order } from "../database.js";
import { requireAuth, requireNoAuth } from "../auth.js";
import { uploadProfileImage } from "../my_multer.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.urlencoded({extended: false}))

router.get("/login", requireNoAuth, (req, res) => {
    res.render(path.join(__dirname, "..", "views", "login.ejs"))
})

router.post("/update", requireAuth, async (req, res) =>{
    const first_name = req.body.first_name ?? null
    const last_name = req.body.last_name ?? null
    const new_password = req.body.new_password ?? null
    const current_password = req.body.current_password ?? null

    let data = {first_name: first_name, last_name: last_name}

    if(new_password){
        if(!current_password){
            return res.status(400).render(path.join(__dirname, "..", "views", "profile.ejs"), {user: req.user, section: "general", data: [], error: "Must have current password."})
        }
        if(!(await bcrypt.compare(current_password, req.user.password))){
            return res.status(400).render(path.join(__dirname, "..", "views", "profile.ejs"), {user: req.user, section: "general", data: [], error: "Password Incorrect."})
        }
        else{
            const hashed_password = await bcrypt.hash(new_password, 10)
            data["password"] = hashed_password
        }
    }

    await findByIdAndUpdate(req.user.customer_id, data)
    res.redirect("/user/profile/general")
})

router.get("/register", requireNoAuth, (req, res) =>{
    res.render(path.join(__dirname, "..", "views", "register.ejs"))
})

router.get("/profile/:section", requireAuth, async (req, res) =>{
    const section = req.params.section || "general"
    const user = req.user ?? null
    let data = []
    const error = undefined;
    if(section === 'cart'){
        const cart_id = await get_cart_id(user.customer_id)
        if(cart_id){
            data.push(await get_cart_products(cart_id))
            data.push(await get_order_total(cart_id))
        } else{
            data.push(null)
            data.push(0.00)
        }
    }
    res.render(path.join(__dirname, "..", "views", "profile.ejs"), {user, section, data, error})
})

router.post('/register', requireNoAuth, async (req, res) =>{
    
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const user = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email, 
            password: hashedPassword,
        }

        const isUser = await check_account(user.email)
        if (isUser){
            return res.render('../views/register.ejs', {error: "There is already an account with this email."})
        }

        register_account(user)

        res.redirect('/user/login')
    } catch (error) {
        console.log(error)
        res.status(500).redirect('/user/register');
    }
    console.log(users)
})

router.post("/login", requireNoAuth, async (req, res) =>{
    const user = await get_account(null, req.body.email)
    if (!user || !(await bcrypt.compare(req.body.password, user.password))){
        return res.render("../views/login.ejs", {error: "Invalid credentials"})
    }

    const token = jwt.sign({ 
        id: user.customer_id,
        first_name: user.first_name,
        last_name: user.last_name
    },
         process.env.ACCESS_SECRET_TOKEN,
        {expiresIn: "10 min"});

    res.cookie("token", token, {httpOnly: true});
    res.redirect('/');
})

router.get("/logout", requireAuth, async (req, res) =>{
    res.clearCookie("token")
    return res.redirect("/")
})

router.post("/profile/photo", requireAuth,
    uploadProfileImage.single("profile_image"), 
    async (req, res) => {
        try {
            const imagePath = `/images/profile_icons/${req.file.filename}`;
            await findByIdAndUpdate(req.user.customer_id, {
                profile_image: imagePath
            })
            
            res.redirect("/user/profile/general");
        } catch(err){
            console.log(err)
            res.status(500).send(err.message)
        }
})

router.post("/cart/add_product", requireAuth, async (req, res) =>{
    try{
        const user = req.user;
        const product_name = req.body.name;
        const product = await get_product_info(product_name)
        const amount = req.body.amount;
        await add_to_cart(product.product_id, amount, user.customer_id)
        res.redirect("/user/profile/cart")
    }
    catch (err){
        console.log(err)
        res.status(500).send("Internal Error")
    }
})

router.post("/cart/finalize_order", requireAuth, async (req, res) =>{
    try{
        const user = req.user;
        const cart_id = await get_cart_id(user.customer_id)
        finish_order(cart_id)
        res.redirect("/user/profile/general")
    } catch(err){
        res.send("Error")
    }
})


export default router;