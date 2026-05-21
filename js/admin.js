const API_BASE = 'http://localhost:3000';


let addButton = document.querySelector('.addProduct');
let editButton = document.querySelector('.editProduct');
const form = document.getElementById('addProductForm');
const editForm = document.getElementById('editProductForm');
const imageInput = document.getElementById('imageInput');
const imageEditInput = document.getElementById('imageEditInput');
const imagePathInput = document.getElementById('imagePathInput');
const imagePathEditInput = document.getElementById('imagePathEditInput');
const searchInput = document.querySelector('.searchForEdit');
const searchDeleteInput = document.querySelector('.searchForDelete');
const searchResultBox = document.querySelector('.searchResultBox');
const searchDeleteResultBox = document.querySelector('.searchDeleteResultBox')
const editProductLegend = document.querySelector('.editProductLegend');
const editProductForm = document.getElementById('editProductForm');
const deleteProductButton = document.querySelector('.deleteProductButton');
const deleteProduct = document.querySelector('.deleteProduct');
const deleteEvent = document.querySelector('.deleteEvent');

let allProducts = [];
let currentItem;


function isAdmin() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin';
}

if (isAdmin() === false) {
    document.location.href = "/";
}


imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        imagePathInput.value = 'images/' + file.name;
    }
});

imageEditInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        imagePathEditInput.value = 'images/' + file.name;
    }
});


function addButtonEvent() {
    currentSection = document.querySelector('.addEvent');
    hideAllSections();
    currentSection.style.display = 'block';
}

function editButtonEvent() {
    currentSection = document.querySelector('.editEvent');
    hideAllSections();
    currentSection.style.display = 'block';
}

function hideAllSections() {
    allSections = document.querySelectorAll('.eventSection');
    allSections.forEach(section => {
        section.style.display = 'none';
    });
};

function collectFormData() {
    const form = document.getElementById('addProductForm');
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());
    userData.image = document.getElementById('imagePathInput').value;

    return userData;
}

function collectEditFormData() {
    const form = document.getElementById('editProductForm');
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());
    userData.image = document.getElementById('imagePathEditInput').value;
    const imagePath = document.getElementById('imagePathEditInput').value.trim();
    if (imagePath) {
        userData.image = imagePath;
    } else {
        delete userData.image;
    }

    return userData;
}

async function onFormSubmit(event) {
    event.preventDefault();

    const userData = collectFormData();
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const newProduct = await response.json();
            alert(`Товар успешно добавлен`);
            form.reset();
            document.querySelector('#nicknameInput').style.borderColor = '';
            errorNickDiv.style.display = 'none';
        } else {
            const error = await response.json();
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadAllProducts() {
    const response = await fetch(`${API_BASE}/products`);
    return response.json();
}

function clickEditElementEvent(e) {
    const productDiv = e.currentTarget;
    const id = productDiv.dataset.id;
    currentItem = id;

    searchResultBox.innerHTML = '';
    searchInput.value = '';

    let p = [...allProducts].find(prod => prod.id === id);
    console.log(p);

    const div = document.createElement('div');
    div.className = 'productForEdit';
    div.dataset.id = p.id;
    div.innerHTML = `
                    <div class="productName">${p.name}</div>
                    <div class="productPrice">${p.price}</div>
                    <div class="productSalePrice">${p.sailPrice}</div>
                `
    searchResultBox.appendChild(div);
    inputDefaultDataOnForm(id);

    editProductForm.style.display = 'block';
}


function clickDeleteElementEvent(e) {
    const productDiv = e.currentTarget;
    const id = productDiv.dataset.id;
    currentItem = id;

    searchDeleteResultBox.innerHTML = '';
    searchInput.value = '';

    let p = [...allProducts].find(prod => prod.id === id);
    console.log(p);

    const div = document.createElement('div');
    div.className = 'productForDelete';
    div.dataset.id = p.id;
    div.innerHTML = `
                    <div class="productName">${p.name}</div>
                    <div class="productPrice">${p.price}</div>
                    <div class="productSalePrice">${p.sailPrice}</div>
                `
    searchDeleteResultBox.appendChild(div);

    deleteProductButton.style.display = 'flex';
}

function renderProducts(products, name, className, box) {
    box.innerHTML = '';
    let filteredProducts = [...products].filter(prod => prod.name.toLowerCase().includes(name.toLowerCase()));

    filteredProducts.forEach(p => {
        const div = document.createElement('div');
        div.className = `${className}`;
        div.dataset.id = p.id;
        div.innerHTML = `
                    <div class="productName">${p.name}</div>
                    <div class="productPrice">${p.price}</div>
                    <div class="productSalePrice">${p.sailPrice}</div>
                `

        if (className === 'productForEdit') {
            div.addEventListener('click', clickEditElementEvent);
        }
        else {
            div.addEventListener('click', clickDeleteElementEvent);
        }
        box.appendChild(div);
    });
}

function updateInputEvent() {
    renderProducts(allProducts, searchInput.value, 'productForEdit', searchResultBox);
}


function updateDeleteInput() {
    renderProducts(allProducts, searchDeleteInput.value, 'productForDelete', searchDeleteResultBox)
}

async function inputDefaultDataOnForm(id) {
    const nameEditInput = document.getElementById('nameEditInput');
    const priceEditInput = document.getElementById('priceEditInput');
    const salePriceEditInput = document.getElementById('salePriceEditInput');
    const rateEditInput = document.getElementById('rateEditInput');

    const product = allProducts.find(pr => pr.id === id);

    nameEditInput.value = product.name;
    priceEditInput.value = product.price;
    salePriceEditInput.value = product.sailPrice;
    rateEditInput.value = product.rating;
}


async function onEditFormSumbit(event) {
    event.preventDefault();

    const userData = collectEditFormData();
    try {
        const response = await fetch(`${API_BASE}/products/${currentItem}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const newProduct = await response.json();
            alert(`Товар успешно изменен`);
            form.reset();
        } else {
            const error = await response.json();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteProductEvent() {
    const rescponce = await fetch(`${API_BASE}/products/${currentItem}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })
}

async function deleteButtonEvent() {
    hideAllSections();
    deleteEvent.style.display = 'block';
}

async function getAllReviews() {
    const response = await fetch(`${API_BASE}/feedback`);
    return await response.json();
}

async function init() {
    form.addEventListener('submit', onFormSubmit);
    editForm.addEventListener('submit', onEditFormSumbit)
    addButton.addEventListener('click', addButtonEvent);
    editButton.addEventListener('click', editButtonEvent);
    allProducts = await loadAllProducts();
    searchInput.addEventListener('input', updateInputEvent);
    searchDeleteInput.addEventListener('input', updateDeleteInput);
    deleteProductButton.addEventListener('click', deleteProductEvent);
    deleteProduct.addEventListener('click', deleteButtonEvent);

    let reviews = await getAllReviews();
    console.log(reviews);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});