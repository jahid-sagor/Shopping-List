//IIFE
( ()=> {

const filterElm = document.querySelector('#filter')
const formElm = document.querySelector('form')
const proNameElm = document.querySelector('.nameInput')
const proPriceElm = document.querySelector('.priceInput')
const msgElm = document.querySelector('.msg')
const collectionElm = document.querySelector('.collection')
const submitBtnElm = document.querySelector('.submit-btn button')

let products = localStorage.getItem('storeProducts') ? JSON.parse(localStorage.getItem('storeProducts')) : []

function reciveInput(){
    const name = proNameElm.value
    const price = proPriceElm.value
    return {name, price}
}

function clearMsg() {
    msgElm.textContent = ''
}

function showMessage(msg, action = "success") {
    const textMsg = `<div class="alert alert-${action}" role="alert">
    ${msg}
  </div>`
    msgElm.insertAdjacentHTML('afterbegin', textMsg)
   setTimeout(()=>{
    clearMsg()
   }, 2000)
}

function validateInputs(name , price) {
    let isValid = true
    //cheak empty input
    if (name === '' || price === '' ) {
        isValid = false
        showMessage('Please Provide Necessary Informetion!', 'danger')
    }
    if (Number(price) !== Number(price)) {
        isValid = false
        showMessage('Please Provide Number!', 'danger')     
    }
    return isValid
}

function resetInput() {
    proNameElm.value = ''
    proPriceElm.value = ''
}

function addProduct(name,price) {
    const product = {
        id: products.length + 1,
        name,
        price,
      }
      //memory data store
      products.push(product)
      return product
}

function showProductToUI(product) {
   const {id ,name, price} = product;
   const  elm = `<li
    class="list-group-item collection-item d-flex flex-row justify-content-between " data-productId="${id}"
  >
    <div class="product-info">
      <strong>${name}</strong>- <span class="price">$${price}</span>
    </div>
    <div class="action-btn">
      <i class="fa fa-pencil-alt edit-product me-2"></i>
      <i class="fa fa-trash-alt delete-product"></i>
    </div>
  </li> `
  collectionElm.insertAdjacentHTML('afterbegin', elm)
  showMessage('Add Product seccessfully.')
}

function addProductToLocalStorage(product) {
     let products
     if (localStorage.getItem('storeProducts')) {
        products = JSON.parse(localStorage.getItem('storeProducts'))
        //update and add the new product
        products.push(product)
    }else{
        products = []
        products.push(product)
     }
      //save to localStorage
      localStorage.setItem('storeProducts', JSON.stringify(products))
}

function updateProduct(recevedProduct, storageProducts = products) {
    const updateProducts = storageProducts.map((product => {
        if (product.id === recevedProduct.id) {
            return {
                ...product,
               name: recevedProduct.name,
               price: recevedProduct.price
            }
        }else{
            return product
        }
    }))
    return updateProducts
    
}

function clearEditForm() {
    submitBtnElm.classList.remove('update-product')
    submitBtnElm.classList.remove('btn-secondary')
    submitBtnElm.textContent = 'Submit'
    submitBtnElm.removeAttribute('[data-id]')
}

function updateProductToStorage(product) {
    //#long way
    //find the existing product from localStorage
    let products
     products = JSON.parse(localStorage.getItem('storeProducts'))
    //update the product 
    products = updateProduct(product, products)
    //save to the local storage
      localStorage.setItem('storeProducts', JSON.stringify(products))
    //alternative way
    // localStorage.setItem('storeProducts', JSON.stringify(products))
}

function handleFormSubmit(e) {
    //prevent browser loading
    e.preventDefault();
   //receving the input
   const {name , price} = reciveInput()
   //validation cheak
  const isValid = validateInputs(name , price)
  if (!isValid) return
  //reset input
  resetInput()
 
  if (submitBtnElm.classList.contains('update-product')) {
    //user want to update the  product
    console.log('update-product');
    const id = Number(submitBtnElm.dataset.id)
    //update data to memory store
    const product = {
        id,
        name,
        price
    }
   const updateProducts =  updateProduct(product)
    //memory store update
     products = updateProducts
    //localStorage update 
      updateProductToStorage(product)
   //DOM update
    showAllProductToUI(products)

    //clear the edit state
    clearEditForm()
    return
    
  }else{
     //add product to data store
  const product = addProduct(name, price)
  showProductToUI(product)
  //add data to lopcalStorage
  addProductToLocalStorage(product)
  }
   console.log(name, price);
}

function getProductId(e) {
    const liElm = e.target.parentElement.parentElement
    const id = Number(liElm.getAttribute('data-productId'))
    return id
    
}

function removeItem(id) {
    products = products.filter((product)=> product.id !== id)
}

function removeFromUI(id) {
    document.querySelector(`[data-productId="${id}"]`).remove()
    showMessage('Product Deleted Successfully', 'warning')
}

function notFoundElm(id) {
    localStorage.getItem('')
}

function removeProductFromStorage(id) {
   let products
   products = JSON.parse(localStorage.getItem('storeProducts'))
   products = products.filter(products => products.id !== id)
   localStorage.setItem('storeProducts', JSON.stringify(products))
}

function findingTheProduct(id) {
    const foundProduct = products.find((product) => product.id === id)
    return foundProduct
}

function populateEditForm(product) {
    proNameElm.value = product.name
    proPriceElm.value = product.price
    //change button submit
   submitBtnElm.textContent = 'Update Product'
   submitBtnElm.classList.add('btn-secondary')
   submitBtnElm.classList.add('update-product')
   submitBtnElm.setAttribute('data-id', product.id)
}

function handleManupulate(e) {
    const id = getProductId(e)
    if (e.target.classList.contains('delete-product')) {
        //get the product id
       //remove product from data store
        removeItem(id)
        //remove item from localStorage
        removeProductFromStorage(id)
       //remove Product from UI
       removeFromUI(id)
    }else if (e.target.classList.contains('edit-product')) {
       //finding the product
      const foundProduct = findingTheProduct(id)
      //populating existing form in edit state
      populateEditForm(foundProduct)
      //update exsisting product

    }
    
}

function showAllProductToUI(products) {
    //remove not Found product
    const notFoundElm = document.querySelector('.not-found-product')
    if(notFoundElm){
        notFoundElm.remove()
    }
    //clear existing content from colectionElm/ul
    collectionElm.textContent = ''
    //looping
    let liElms
   liElms = products.length === 0 ? '<li class="list-group-item collection-item not-found-product"> No products to show </li>' : ''

   //sorting
   products.sort((a,b)=> b.id - a.id )
   products.forEach(product => {
   const  { id,name,price } = product
   liElms +=     `<li
          class="list-group-item collection-item d-flex flex-row justify-content-between"
          data-productId= "${id}">
          <div class="product-info">
            <strong>${name}</strong>- <span class="price">$${price}</span>
          </div>
          <div class="action-btn">
            <i class="fa fa-pencil-alt edit-product float-right me-2"></i>
            <i class="fa fa-trash-alt delete-product float-right"></i>
          </div>
        </li>
 `
 })
 collectionElm.insertAdjacentHTML('afterbegin',liElms)
}
function handleFilter(e) {
   const text = e.target.value
    const filteredProduct = products.filter(product => product.name.includes(text.toLowerCase()))
    showAllProductToUI(filteredProduct)
}

function init() {
    formElm.addEventListener('submit',handleFormSubmit)
    
    collectionElm.addEventListener('click', handleManupulate)
    
    filterElm.addEventListener('keyup', handleFilter)
    
    document.addEventListener('DOMContentLoaded', ()=> showAllProductToUI(products))   
}
init()

})()

