function formatPrice(price) {
    if (!price && price !== 0) return "0";
    const num = Number(price);
    if (isNaN(num)) return price.toString();
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
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

const API_BASE = 'http://localhost:3000';

let allProducts = [];
let favoritesList = [];
let cartItems = [];
let currentDisplayedProducts = [];
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
        alert('Не удалось загрузить данные с сервера. Убедитесь, что json-server запущен.');
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
        alert('Товар добавлен в избранное!');
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
        alert('Товар добавлен в корзину');
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
    const container = document.querySelector('.productCards');
    if (!container) return;
    container.innerHTML = '';
    currentDisplayedProducts = productsArray;

    if (!productsArray || productsArray.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-message';
        emptyDiv.innerText = 'Товары не найдены. Попробуйте другой запрос.';
        container.appendChild(emptyDiv);
        return;
    }

    productsArray.forEach(product => {
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
    updateCartCounter();
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

function updateCatalogWithSort() {
    let filtered = filterBySearch(allProducts, currentSearchTerm);
    filtered = filterByCategories(filtered);
    const sortType = document.getElementById('sortingSelect')?.value || 'default';
    const sorted = sortProducts(filtered, sortType);
    renderProducts(sorted);
    const productCountSpan = document.getElementById('productCount');
    if (productCountSpan) productCountSpan.innerText = sorted.length;
}

function filterLowPrice() {
    const filtered = allProducts.filter(p => Number(p.sailPrice) < 5500);
    renderProducts(filtered);
    updateProductCount(filtered.length);
}

function filterSofaOnly() {
    const sofas = allProducts.filter(p => p.type === 'sofa');
    const hasExpensiveSofa = sofas.some(sofa => Number(sofa.price) > 10000);
    alert(hasExpensiveSofa
        ? `Найдено ${sofas.length} диванов. Есть диваны дороже 10000 руб.!`
        : `Найдено ${sofas.length} диванов. Все диваны дешевле 10000 руб.`);
    renderProducts(sofas);
    updateProductCount(sofas.length);
}

function mapIncreasePrice() {
    const increased = allProducts.map(p => ({
        ...p,
        price: Math.round(Number(p.price) * 1.15).toString(),
        sailPrice: Math.round(Number(p.sailPrice) * 1.15).toString(),
        name: `${p.name} +15%`
    }));
    renderProducts(increased);
    updateProductCount(increased.length);
}

function sortByPriceAsc() {
    const sorted = [...allProducts].sort((a, b) => Number(a.price) - Number(b.price));
    renderProducts(sorted);
    updateProductCount(sorted.length);
}

function ShiftFirstElem() {
    const newArray = [...allProducts];
    newArray.shift();
    renderProducts(newArray);
    updateProductCount(newArray.length);
}

function reduceMaxPriceProduct() {
    if (!allProducts.length) return;
    const maxProduct = allProducts.reduce((max, curr) =>
        Number(curr.price) > Number(max.price) ? curr : max, allProducts[0]);
    renderProducts([maxProduct]);
    updateProductCount(1);
}

function sliceFirstFour() {
    const firstFour = allProducts.slice(0, 4);
    renderProducts(firstFour);
    updateProductCount(firstFour.length);
}

function findChairProduct() {
    const found = allProducts.find(p => p.name.toLowerCase().includes('кресло'));
    renderProducts(found ? [found] : []);
    updateProductCount(found ? 1 : 0);
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
    updateProductCount(newArr.length);
}

function reverseOrder() {
    const reversed = [...allProducts].reverse();
    renderProducts(reversed);
    updateProductCount(reversed.length);
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

function searchBox() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value;
        updateCatalogWithSort();
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
    const sortSelect = document.getElementById('sortingSelect');
    if (sortSelect) sortSelect.addEventListener('change', updateCatalogWithSort);
    await loadAllData();
});