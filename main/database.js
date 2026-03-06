import mysql from 'mysql2'
import dotenv from 'dotenv'
import { error } from 'console'
import { response } from 'express'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    connectionLimit: 10
}).promise()

// const result = await pool.query("SELECT * FROM customer")
// 

async function insert(){
    const result = await pool.query()
}

export async function get_table(table) {
    const customer_data = await pool.query(`SELECT * FROM ${table}`)
    const customer_info = customer_data[0]

    return customer_data[0];
}

export async function get_featured_products(limit){
    const product_data = await pool.query(`SELECT name, ROUND(cost, 2) AS cost,CASE WHEN amount = 0 THEN "Out"
                                           WHEN amount <= 100 THEN CONCAT(amount, " left")
                                           ELSE "High" END AS stock 
                                           FROM product
                                           ORDER BY rating LIMIT ${limit}`)
    return product_data[0];
}

export async function get_products(offset, limit, key = null){
    let data;
    
    if (key != null){
        const tokens = key.split(" ").filter(Boolean);
        const likeClauses = tokens.map(() => `name LIKE ?`).join(" OR ");
        const params = tokens.map(t => `%${t}%`);

        data = await pool.query(`SELECT name, cost,CASE WHEN amount = 0 THEN "Out"
                                   WHEN amount <= 100 THEN CONCAT(amount, " left")
                                   ELSE "High" END AS stock 
                                   FROM product
                                   WHERE ${likeClauses}
                                   ORDER BY rating LIMIT ${limit} OFFSET ${offset}`, params)
    } else {
    data = await pool.query(`SELECT name, cost,CASE WHEN amount = 0 THEN "Out"
                                   WHEN amount <= 100 THEN CONCAT(amount, " left")
                                   ELSE "High" END AS stock 
                                   FROM product
                                   ORDER BY rating LIMIT ${limit} OFFSET ${offset}`)
    }
    return data[0];
}

export async function get_product_count(search = null){
    let data;
    
    if(search == null){
        data = await pool.query(`SELECT COUNT(*) AS count FROM product`)
    } else {
        const tokens = search.split(" ").filter(Boolean);
        const likeClauses = tokens.map(() => `name LIKE ?`).join(" OR ");
        const params = tokens.map(t => `%${t}%`);

        data = await pool.query(`SELECT COUNT(*) AS count FROM product WHERE ${likeClauses}`, params)
    }

    return data[0]

}

export async function get_account(id = null, email = null) {
    let fetch = `SELECT * FROM customer WHERE`

    if (id){
        fetch += ` customer_id = ${id}`
    } else{
        fetch += ` email = '${email}'`
    }
    
    const [customer] = await pool.query(fetch)
    return customer[0]
}

export async function check_account(email){
    const [data_res] = await pool.query(`SELECT COUNT(*) AS count FROM customer WHERE email = '${email}'`)
    const is_account = data_res[0].count

    return is_account > 0;
}

export function register_account(user){
    pool.query(`INSERT INTO customer (first_name, last_name, email, password)
                VALUES ('${user.first_name}', '${user.last_name}', '${user.email}', '${user.password}')`)
}

export async function get_product_info(name){
    const [results] = await pool.query(`SELECT product_id, name, rating, print_source, cost, CASE WHEN amount = 0 THEN "Out"
                                   WHEN amount <= 100 THEN CONCAT(amount, " left")
                                   ELSE "High" END AS stock 
                                   FROM product
                                   WHERE name = '${name}'`)
    return results[0]
}

export async function findByIdAndUpdate (id, updateData){
    let fields = []
    if (updateData.profile_image){
        fields.push(`icon_url = '${updateData.profile_image}'`)
    }
    if(updateData.first_name != ''){
        fields.push(`first_name = '${updateData.first_name}'`)
    }
    if(updateData.last_name != ''){
        fields.push(`last_name = '${updateData.last_name}'`)
    }
    if(updateData.password){
        fields.push(`password = '${updateData.password}'`)
    }

    await pool.query(`UPDATE customer
                    SET ${fields.join(', ')}
                    WHERE customer_id = ${id}`)
}

export async function get_cart_id(customer_id){
    const [result] = await pool.query(`SELECT order_id FROM \`order\` WHERE customer_id = ${customer_id} ORDER BY order_date DESC LIMIT 1;`)
    return result[0]['order_id']
}

export async function is_current_order(customer_id){
    const [results] = await pool.query(`SELECT COUNT(*) AS is_order FROM \`order\` WHERE customer_id = ${customer_id} AND finish_date is null`)
    const is_order = results[0]['is_order']
    return is_order
}

export function create_new_order(customer_id){
    pool.query(`INSERT INTO \`order\` (customer_id, order_date) VALUES (${customer_id}, CURDATE())`)
}

export async function add_to_cart(product_id, amount, customer_id){
    if ((await is_current_order(customer_id) == false)){
        create_new_order(customer_id)
    }
    const cart_id = await get_cart_id(customer_id);
    pool.query(`INSERT INTO product_order (product_id, purchase_amount, order_id) VALUES (${product_id}, ${amount}, ${cart_id})`)
}

export async function get_cart_products(order_id){
    const [result] = await pool.query(`SELECT name, purchase_amount, ROUND(purchase_amount * cost, 2) AS cost
                                 FROM product_order po
                                 JOIN product ON po.product_id = product.product_id
                                 WHERE order_id = ${order_id};`)

    const products = result
    return products
}

export async function get_order_total(order_id){
    const [result] = await pool.query(`SELECT ROUND(SUM(purchase_amount * cost), 2) AS total_cost
                                       FROM product_order po
                                       JOIN product ON po.product_id = product.product_id
                                       WHERE order_id = ${order_id};`)
    return result[0]['total_cost']
}