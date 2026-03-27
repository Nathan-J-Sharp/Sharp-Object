

// Main Dynamics

// nav dynamics

function toggle_nav(){
    let nav = document.getElementById("navbar")
    let menu_button = document.getElementById("menu_button")
    nav.classList.toggle("open");
}

const nav = document.getElementById("nav-wrapper")
const logo = document.querySelector(".logo_link")
let nav_offset = window.pageYOffset + logo.getBoundingClientRect().bottom;
const hero = document.getElementById("hero")
const banner = document.getElementById("banner")
const contact_page = document.getElementById("contact_page")

function updateNavOffset() {
    nav_offset = window.pageYOffset + logo.getBoundingClientRect().bottom;
}

window.addEventListener("resize", updateNavOffset); 

function toggle_sticky(){
    if (window.pageYOffset >= nav_offset){
        nav.classList.add('sticky')
        if (hero) {
            hero.classList.add('sticky')
        } else if (banner) {
            banner.classList.add('sticky')
        } else if(contact_page){
            contact_page.classList.add('sticky')
        }
    } else {
        nav.classList.remove('sticky')
        if (hero) {
            hero.classList.remove('sticky')
        } else if (banner) {
            banner.classList.remove('sticky')
        } else if(contact_page){
            contact_page.classList.remove('sticky')
        }
        
        
    }
}

window.addEventListener('scroll', toggle_sticky)
document.getElementById("menu_button").addEventListener("click", toggle_nav)

// search bar dynamics
function open_search_bar(){
    filter = document.getElementById("filter_bar")
    filter.classList.add('open')
}

// async function get_products(limit = 50, filter = ''){
//     const response = await fetch('/data/products')
//     const product_data = await response.json()


//     let total_products = 0
//     let i_product = 0
//     let html = ``

//     while (total_products < limit && i_product < product_data.length){
//         const product_info = product_data[i_product]
//         if (filter == '' | product_info.name == filter){
//             html += product_template('/images/NO_Image.png', 'no image',
//                 product_info.name, product_info.rating, product_info.amount
//             )
//             total_products += 1
//         }
        
//         i_product += 1
//     }

//     console.log(html)

//     const product_sect = document.getElementById('hproducts')

//     product_sect.innerHTML = html
// }

// function product_template(image_path, alternate, product_name, product_price,
//                           stock)
// {
//     const template = `
//     <section class="product">
//         <img src="${image_path}" alt="${alternate}">
//         <a href="#"><h3>${product_name}</h3></a>
//         <div class="product_info">
//             <h4>${stock}</h4>
//             <h4>${product_price}</h4>
//         </div>
//     </section>
//     `

//     return template
// }