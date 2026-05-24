const API_BASE = 'http://localhost:3000';

let allProducts = [];
let favoritesList = [];   
let cartItems = [];       

function formatPrice(price) {
    if (!price && price !== 0) return "0";
    const num = Number(price);
    if (isNaN(num)) return price.toString();
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function fetchProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Ошибка загрузки товаров');
    return res.json();
}

async function fetchFavorites() {
    const res = await fetch(`${API_BASE}/favorites`);
    if (!res.ok) throw new Error('Ошибка загрузки избранного');
    return res.json();
}

async function fetchCart() {
    const res = await fetch(`${API_BASE}/cart`);
    if (!res.ok) throw new Error('Ошибка загрузки корзины');
    return res.json();
}

function updateCartCounter() {
    const span = document.getElementById('cartCount');
    if (span && cartItems.length) {
        const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        span.innerText = total;
    } else if (span) {
        span.innerText = '0';
    }
}

function updateFavCounter() {
    const favSpan = document.getElementById('favoritesCount');
    if (favSpan) {
        favSpan.innerText = favoritesList.length;
    }
}

async function addToCart(productId) {
    try {
        const existing = cartItems.find(item => item.productId === productId);
        if (existing) {
            const newQty = existing.quantity + 1;
            await fetch(`${API_BASE}/cart/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQty })
            });
            existing.quantity = newQty;
        } else {
            const res = await fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity: 1 })
            });
            const newItem = await res.json();
            cartItems.push(newItem);
        }
        showNotification('Товар добавлен в корзину');
        updateCartCounter();
    } catch (err) {
        console.error('Ошибка добавления в корзину:', err);
        showNotification('Не удалось добавить товар в корзину');
    }
}

async function removeFromFavorites(favId, productId) {
    try {
        await fetch(`${API_BASE}/favorites/${favId}`, { method: 'DELETE' });
        favoritesList = favoritesList.filter(f => f.id !== favId);
        renderFavorites();
        updateFavCounter();
    } catch (err) {
        console.error('Ошибка удаления из избранного:', err);
        showNotification('Не удалось удалить товар из избранного');
    }
}

function renderFavorites() {
    const container = document.querySelector('.favorites-grid');
    if (!container) return;

    if (!favoritesList.length) {
        container.innerHTML = `
            <div class="empty-favorites">
                🧡 В избранном пока ничего нет.<br>
                <a href="catalog.html">Перейти в каталог</a>, чтобы добавить товары.
            </div>
        `;
        return;
    }

    const favProducts = favoritesList
        .map(fav => {
            const product = allProducts.find(p => p.id === fav.productId);
            return product ? { ...fav, product } : null;
        })
        .filter(item => item !== null);

    if (favProducts.length === 0) {
        container.innerHTML = '<div class="empty-favorites">Товары из избранного не найдены в базе.</div>';
        return;
    }

    let html = '';
    favProducts.forEach(({ id: favId, product }) => {
        html += `
            <div class="favorite-card" data-fav-id="${favId}" data-product-id="${product.id}">
                <div class="favorite-card-image">
                    <img src="${product.image}" alt="${escapeHtml(product.name)}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
                </div>
                <div class="favorite-card-info">
                    <div class="favorite-card-name">${escapeHtml(product.name)}</div>
                    <div class="favorite-card-price">
                        <span class="price-old">${formatPrice(product.price)} руб.</span>
                        <span class="price-sale">${formatPrice(product.sailPrice)} руб.</span>
                    </div>
                    <div class="favorite-card-actions">
                        <button type="button" class="btn-add-to-cart">В корзину</button>
                        <button type="button" class="btn-remove-fav">Удалить</button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    document.querySelectorAll('.favorite-card').forEach(card => {
        const favId = card.getAttribute('data-fav-id');
        const productId = card.getAttribute('data-product-id');

        const addBtn = card.querySelector('.btn-add-to-cart');
        const removeBtn = card.querySelector('.btn-remove-fav');

        addBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            addToCart(productId);
        });
        removeBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Удалить товар из избранного?')) {
                removeFromFavorites(favId, productId);
            }
        });
    });
}

async function initFavorites() {
    try {
        const [products, favorites, cart] = await Promise.all([
            fetchProducts(),
            fetchFavorites(),
            fetchCart()
        ]);
        allProducts = products;
        favoritesList = favorites;
        cartItems = cart;
        renderFavorites();
        updateCartCounter();
        updateFavCounter();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        const container = document.querySelector('.favorites-grid');
        if (container) {
            container.innerHTML = '<div class="empty-favorites">Не удалось загрузить избранное. Убедитесь, что json-server запущен.</div>';
        }
    }
}

document.addEventListener('DOMContentLoaded', initFavorites);