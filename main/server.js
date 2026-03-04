import express  from "express";
import {fileURLToPath} from "url";
import path from "path";
// import { profileEnd } from "console";
import product_Router from "./routes/products.js"
import api_router from "./routes/api.js"
import user_router from "./routes/user.js"
import {authUser} from "./auth.js"
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3500;

app.use(cookieParser())
app.use(authUser)
app.use('/products', product_Router);
app.use('/user', user_router)
app.use(express.static("public"));

export const users = []

app.use('/api', api_router)

app.get("/", async (req, res) =>{
    const response = await fetch("http://127.0.0.1:3500/api/products/featured")
    const products = await response.json()
    
    const user = req.user ?? null

    products.forEach(product => {
        product.cost = Number(product.cost).toFixed(2);
    });

    res.status(202).render(path.join(__dirname, "views", "index.ejs"), {products, user});
})

app.get("/contact", (req, res) =>{
    const user = req.user ?? null
    res.status(202).render(path.join(__dirname, "views", "contact.ejs"), {user});
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})