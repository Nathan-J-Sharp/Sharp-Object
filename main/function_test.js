// I use this to test my functions.

import { get_cart_products, get_customer_order_history, get_order_total } from "./database.js";

console.log(await get_customer_order_history(1))

process.exit(0);