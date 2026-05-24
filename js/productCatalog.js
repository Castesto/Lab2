function formatPrice(price) {
    if (!price && price !== 0) return "0";
    const num = Number(price);
    if (isNaN(num)) return price.toString();
    return num.toLocaleString();
}


function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

let currentPage = 1;
const limit = 6;
let totalPages = 1;
let currentFullProducts = [];
let totalCount = 0;

const API_BASE = 'http://localhost:3000';

let allProducts = [];
let favoritesList = [];
let cartItems = [];
let currentSearchTerm = '';
let selectedCategories = new Set();

async function fetchProducts() {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    return await response.json();
}

async function fetchFavorites() {
    const response = await fetch(`${API_BASE}/favorites`);
    if (!response.ok) throw new Error('Ошибка загрузки избранного');
    return await response.json();
}

async function fetchCart() {
    const response = await fetch(`${API_BASE}/cart`);
    if (!response.ok) throw new Error('Ошибка загрузки корзины');
    return await response.json();
}

async function loadAllData() {
    try {
        allProducts = await fetchProducts();
        favoritesList = await fetchFavorites();
        cartItems = await fetchCart();
        updateCatalogWithSort();
        updateFavAndCartIndicators();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showNotification('Ошибка загрузки данных', 'error');
    }
}

async function addToFavorites(productId) {
    try {
        const exists = favoritesList.some(fav => fav.productId === productId);
        if (exists) {
            const favItem = favoritesList.find(fav => fav.productId === productId);
            await fetch(`${API_BASE}/favorites/${favItem.id}`, { method: 'DELETE' });
            favoritesList = favoritesList.filter(fav => fav.productId !== productId);
        } else {
            const newFav = { productId };
            const response = await fetch(`${API_BASE}/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFav)
            });
            const created = await response.json();
            favoritesList.push(created);
        }
        showNotification('Товар добавлен в избранное', 'success');
        updateFavAndCartIndicators();
    } catch (error) {
        console.error('Ошибка при изменении избранного:', error);
    }
}

async function addToCart(productId) {
    try {
        const existing = cartItems.find(item => item.productId === productId);
        if (existing) {
            const newQuantity = existing.quantity + 1;
            await fetch(`${API_BASE}/cart/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity })
            });
            existing.quantity = newQuantity;
        } else {
            const response = await fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            const newItem = await response.json();
            cartItems.push(newItem);
        }
        showNotification('Товар добавлен в корзину', 'success');
        updateCartCounter();
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
    }
}

function updateFavAndCartIndicators() {
    document.querySelectorAll('.card').forEach(card => {
        const buyBtn = card.querySelector('.buyButton');
        if (!buyBtn) return;
        const productId = buyBtn.getAttribute('data-id');
        const likeDiv = card.querySelector('.like');
        if (likeDiv) {
            const isFav = favoritesList.some(fav => fav.productId === productId);
            if (isFav) likeDiv.classList.add('active');
            else likeDiv.classList.remove('active');
        }
    });
    updateCartCounter();
}

function updateCartCounter() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.innerText = totalItems;
    }
}

function renderProducts(productsArray) {
    if (productsArray !== undefined) {
        currentFullProducts = productsArray;
        currentPage = 1;
        totalPages = Math.ceil(currentFullProducts.length / limit);
        updateProductCount(currentFullProducts.length);
    }

    const container = document.querySelector('.productCards');
    if (!container) return;
    container.innerHTML = '';

    if (!currentFullProducts.length) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-message';
        emptyDiv.innerText = 'Товары не найдены. Попробуйте другой запрос.';
        container.appendChild(emptyDiv);
        renderPagination();
        return;
    }

    const startIndex = (currentPage - 1) * limit;
    const endIndex = currentPage * limit;
    const productsToShow = currentFullProducts.slice(startIndex, endIndex);

    productsToShow.forEach(product => {
        const isFav = favoritesList.some(fav => fav.productId === product.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="cardImage">
                <img src="${product.image}" alt="${escapeHtml(product.name)}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
            </div>
            <div class="cardText">${escapeHtml(product.name)}</div>
            <div class="cardPrice">
                <div class="prePrice">${formatPrice(product.price)} руб.</div>
                <div class="price">${formatPrice(product.sailPrice)} руб.</div>
            </div>
            <div class="buyButtonAndLike">
                <button class="buyButton" data-id="${product.id}">КУПИТЬ</button>
                <div class="like ${isFav ? 'active' : ''}">
                    <img src="images/like.png" alt="like">
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    attachEventsToCurrentCards();
    renderPagination();
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHtml = '<ul class="pagination justify-content-center">';

    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>«</button>
        </li>
    `;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <button class="page-link" data-page="1">1</button>
            </li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }

    if (endPage < totalPages) {
        paginationHtml += `
            ${endPage < totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item">
                <button class="page-link" data-page="${totalPages}">${totalPages}</button>
            </li>
        `;
    }

    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
        </li>
    `;
    paginationHtml += '</ul>';

    paginationContainer.innerHTML = paginationHtml;

    paginationContainer.querySelectorAll('.page-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            if (page === 'prev') {
                if (currentPage > 1) goToPage(currentPage - 1);
            } else if (page === 'next') {
                if (currentPage < totalPages) goToPage(currentPage + 1);
            } else {
                goToPage(parseInt(page));
            }
        });
    });
}

function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProducts();
    document.querySelector('.products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function attachEventsToCurrentCards() {
    document.querySelectorAll('.buyButton').forEach(btn => {
        btn.removeEventListener('click', buyHandler);
        btn.addEventListener('click', buyHandler);
    });
    document.querySelectorAll('.like').forEach(like => {
        like.removeEventListener('click', likeHandler);
        like.addEventListener('click', likeHandler);
    });
}

function buyHandler(e) {
    const button = e.currentTarget;
    const productId = button.getAttribute('data-id');
    addToCart(productId);
}

function likeHandler(e) {
    e.stopPropagation();
    const likeDiv = e.currentTarget;
    const card = likeDiv.closest('.card');
    const buyButton = card.querySelector('.buyButton');
    const productId = buyButton.getAttribute('data-id');
    addToFavorites(productId);
}

function filterBySearch(products, searchTerm) {
    if (!searchTerm.trim()) return [...products];
    const term = searchTerm.toLowerCase().trim();
    return products.filter(product => product.name.toLowerCase().includes(term));
}

function filterByCategories(products) {
    if (selectedCategories.size === 0) return products;
    return products.filter(product => selectedCategories.has(product.type));
}

async function fetchFilteredProducts() {
    let params = new URLSearchParams();

    selectedCategories.forEach(cat => {
        params.append('type', cat);
    });

    if (currentSearchTerm.trim()) {
        params.append('name_like', currentSearchTerm.trim());
    }

    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;

    if (minPrice) params.append('price_gte', minPrice);
    if (maxPrice) params.append('price_lte', maxPrice);

    const minSale = document.getElementById('minSale')?.value;
    const maxSale = document.getElementById('maxSale')?.value;

    if (minSale) params.append('sailPrice_gte', minSale);
    if (maxSale) params.append('sailPrice_lte', maxSale);

    const rating = document.getElementById('ratingFilter')?.value;
    if (rating) params.append('rating_gte', rating);

    const queryString = params.toString();

    const response = await fetch(`${API_BASE}/products?${queryString}`);
    if (!response.ok) throw new Error('Ошибка фильтрации');

    return await response.json();
}

function initAdvancedFilters() {
    ['minPrice', 'maxPrice', 'minSale', 'maxSale', 'ratingFilter']
        .forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            el.addEventListener('input', () => {
                updateCatalogWithSort();
            });
        });
}

function sortProducts(products, sortType) {
    const sorted = [...products];
    switch (sortType) {
        case 'price-asc':
            return sorted.sort((a, b) => Number(a.price) - Number(b.price));
        case 'price-desc':
            return sorted.sort((a, b) => Number(b.price) - Number(a.price));
        case 'sale-price-asc':
            return sorted.sort((a, b) => Number(a.sailPrice) - Number(b.sailPrice));
        case 'sale-price-desc':
            return sorted.sort((a, b) => Number(b.sailPrice) - Number(a.sailPrice));
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        default:
            return sorted;
    }
}

async function updateCatalogWithSort() {
    try {
        let products = await fetchFilteredProducts();
        const sortType = document.getElementById('sortingSelect')?.value || 'default';
        const sorted = sortProducts(products, sortType);
        renderProducts(sorted);
    } catch (e) {
        console.error(e);
    }
}

function filterLowPrice() {
    const filtered = allProducts.filter(p => Number(p.sailPrice) < 5500);
    renderProducts(filtered);
}

function filterSofaOnly() {
    const sofas = allProducts.filter(p => p.type === 'sofa');
    const hasExpensiveSofa = sofas.some(sofa => Number(sofa.price) > 10000);
    alert(hasExpensiveSofa
        ? `Найдено ${sofas.length} диванов. Есть диваны дороже 10000 руб.!`
        : `Найдено ${sofas.length} диванов. Все диваны дешевле 10000 руб.`);
    renderProducts(sofas);
}

function mapIncreasePrice() {
    const increased = allProducts.map(p => ({
        ...p,
        price: Math.round(Number(p.price) * 1.15).toString(),
        sailPrice: Math.round(Number(p.sailPrice) * 1.15).toString(),
        name: `${p.name} +15%`
    }));
    renderProducts(increased);
}

function sortByPriceAsc() {
    const sorted = [...allProducts].sort((a, b) => Number(a.price) - Number(b.price));
    renderProducts(sorted);
}

function ShiftFirstElem() {
    const newArray = [...allProducts];
    newArray.shift();
    renderProducts(newArray);
}

function reduceMaxPriceProduct() {
    if (!allProducts.length) return;
    const maxProduct = allProducts.reduce((max, curr) =>
        Number(curr.price) > Number(max.price) ? curr : max, allProducts[0]);
    renderProducts([maxProduct]);
}

function sliceFirstFour() {
    const firstFour = allProducts.slice(0, 4);
    renderProducts(firstFour);
}

function findChairProduct() {
    const found = allProducts.find(p => p.name.toLowerCase().includes('кресло'));
    renderProducts(found ? [found] : []);
}

function concatWithExtra() {
    const extraDemoProduct = {
        id: "concat_demo",
        image: "images/Кровать 5.png",
        type: "special",
        name: "тестовая новинка",
        price: "9900",
        sailPrice: "7900",
        rating: 0
    };
    const newArr = allProducts.concat(extraDemoProduct);
    renderProducts(newArr);
}

function reverseOrder() {
    const reversed = [...allProducts].reverse();
    renderProducts(reversed);
}

function resetToAll() {
    document.querySelector('.search-input').value = '';
    currentSearchTerm = '';
    selectedCategories.clear();
    document.querySelectorAll('.category-checkbox-input').forEach(cb => cb.checked = false);
    updateCatalogWithSort();
}

function updateProductCount(count) {
    const span = document.getElementById('productCount');
    if (span) span.innerText = count;
}

function bindMethodButtons() {
    document.getElementById('filterLowPrice')?.addEventListener('click', filterLowPrice);
    document.getElementById('filterSofa')?.addEventListener('click', filterSofaOnly);
    document.getElementById('mapIncreasePrice')?.addEventListener('click', mapIncreasePrice);
    document.getElementById('sortPriceAsc')?.addEventListener('click', sortByPriceAsc);
    document.getElementById('sortSaleDesc')?.addEventListener('click', ShiftFirstElem);
    document.getElementById('reduceMaxPrice')?.addEventListener('click', reduceMaxPriceProduct);
    document.getElementById('sliceFirstFour')?.addEventListener('click', sliceFirstFour);
    document.getElementById('findChair')?.addEventListener('click', findChairProduct);
    document.getElementById('concatNewItem')?.addEventListener('click', concatWithExtra);
    document.getElementById('reverseOrder')?.addEventListener('click', reverseOrder);
    document.getElementById('resetAll')?.addEventListener('click', resetToAll);
}

// function searchBox() {
//     const searchInput = document.querySelector('.search-input');
//     if (!searchInput) return;
//     searchInput.addEventListener('input', (e) => {
//         currentSearchTerm = e.target.value;
//         updateCatalogWithSort();
//     });
// }

function searchBox() {
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('search-input')) {
            currentSearchTerm = e.target.value;
            updateCatalogWithSort();
        }
    });
}

function initCategoryFilters() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox-input');
    if (!categoryCheckboxes.length) return;
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const value = e.target.value;
            if (e.target.checked) selectedCategories.add(value);
            else selectedCategories.delete(value);
            updateCatalogWithSort();
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    bindMethodButtons();
    searchBox();
    initCategoryFilters();
    initAdvancedFilters();
    const sortSelect = document.getElementById('sortingSelect');
    if (sortSelect) sortSelect.addEventListener('change', updateCatalogWithSort);
    await loadAllData();
});