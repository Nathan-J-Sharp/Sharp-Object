// I use this to test my functions.

import { get_cart_products, get_order_total } from "./database.js";

console.log(await get_order_total(0))

process.exit(0);