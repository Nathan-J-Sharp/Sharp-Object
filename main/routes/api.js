import express  from "express";
import {fileURLToPath} from "url";
import path from "path";
import {get_featured_products, get_products, get_product_count} from "../database.js"
const router = express.Router();

router.get("/products/featured", async (req, res) => {
    const products = await get_featured_products(5); 
    res.status(202).json(products);
})

router.get("/products", async (req, res) =>{
    const limit = req.query.limit;
    const offset = req.query.offset;
    const k = req.query.k;
    
    let products;

    if (k){
        products = await get_products(offset, limit, k)
    } else{
        products = await get_products(offset, limit)
    }
    res.json(products)

})

router.get("/products/count", async (req, res) => {
    const k = req.query.k
    let countRes;

    if (k)
        countRes = await get_product_count(k);
    else {
        countRes = await get_product_count();
    }
    const count = countRes[0];
    res.status(202).json(count);
})

export default router;