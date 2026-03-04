import express, { Router }  from "express";
import {fileURLToPath} from "url";
import path from "path";
import { json } from "stream/consumers";
import { get_product_info } from "../database.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/', async (req, res) =>{
    const page = Number(req.query.page) || 1;
    const k = req.query.k;
    const limit = 10;
    let offset;
    const user = req.user ?? null

    offset = (page - 1) * 10;

    // Get count of products.
    let countRes;

    if (!k){
        countRes = await fetch("http://127.0.0.1:3500/api/products/count");
    } else{
        countRes = await fetch(`http://127.0.0.1:3500/api/products/count?k=${k}`)
    }
    const countDict = await countRes.json();
    const count = countDict.count

    const totalPages = Math.ceil(count / limit);

    if (page > totalPages) {
        return res.redirect(`/products?page=${totalPages}`);
    }
    if (page < 1) {
        return res.redirect(`/products?page=1`)
    }

    // Get the product page data.
    let product_data;

    if(k){
        product_data = await fetch(`http://127.0.0.1:3500/api/products?offset=${offset}&limit=${limit}&k=${k}`)
    }else {
        product_data = await fetch(`http://127.0.0.1:3500/api/products?offset=${offset}&limit=${limit}`);
    }
    
    const products = await product_data.json()
    products.forEach(product => {
        product.cost = Number(product.cost).toFixed(2);
    });

    // Return data, page number, and total pages.
    res.status(202).render(path.join(__dirname, "..", "views", "products.ejs"), { products, page, totalPages, k, user })
})

router.get('/:name', async (req, res) =>{
    const name = req.params.name
    const product = await get_product_info(name)
    const user = req.user ?? null
    if (name == undefined){
        res.status(400).send("Error")
    } else{
        res.status(202).render(path.join(__dirname, "..", "views", "product.ejs"), {product, user})
    }
})

export default router;