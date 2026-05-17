const API_BASE = 'http://localhost:3000';

let allProducts = [];
let cartItems = [];

document.addEventListener('submit', function (e) {
    e.preventDefault();
});

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

async function fetchProducts() {
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    return await response.json();
}

async function fetchCart() {
    const response = await fetch(`${API_BASE}/cart`);
    if (!response.ok) throw new Error('Ошибка загрузки корзины');
    return await response.json();
}

function updateCartCounter() {
    const cartCountSpan = document.getElementById('cartCount');
    if (cartCountSpan) {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.innerText = totalItems;
    }
}

function calculateTotal() {
    return cartItems.reduce((sum, item) => {
        const product = allProducts.find(p => p.id === item.productId);
        return sum + (product ? product.sailPrice * item.quantity : 0);
    }, 0);
}

function updateTotalSummary() {
    const summaryDiv = document.querySelector('.cart-summary');
    if (summaryDiv) {
        const totalSum = calculateTotal();
        const totalSpan = summaryDiv.querySelector('.total-amount');
        if (totalSpan) {
            totalSpan.innerText = `Общая сумма: ${formatPrice(totalSum)} руб.`;
        }
    }
}

function updateCartItemCard(cartId) {
    const cartItem = cartItems.find(item => item.id === cartId);
    if (!cartItem) return;
    const product = allProducts.find(p => p.id === cartItem.productId);
    if (!product) return;

    const card = document.querySelector(`.cart-card[data-cart-id="${cartId}"]`);
    if (!card) return;

    const quantityInput = card.querySelector('.quantity-input');
    if (quantityInput) quantityInput.value = cartItem.quantity;

    const totalPerItem = product.sailPrice * cartItem.quantity;
    const totalSpan = card.querySelector('.cart-card-total');
    if (totalSpan) totalSpan.innerText = `Итого: ${formatPrice(totalPerItem)} руб.`;

    updateTotalSummary();
    updateCartCounter();
}

function removeCartItemCard(cartId) {
    const card = document.querySelector(`.cart-card[data-cart-id="${cartId}"]`);
    if (card) card.remove();

    if (cartItems.length === 0) {
        renderCartEmpty();
    } else {
        updateTotalSummary();
        updateCartCounter();
    }
}

function renderCartEmpty() {
    const container = document.querySelector('.productCards');
    if (!container) return;
    container.innerHTML = '<div class="empty-message">Корзина пуста. Добавьте товары из каталога.</div>';
    const summaryDiv = document.querySelector('.cart-summary');
    if (summaryDiv) summaryDiv.remove();
    updateCartCounter();
}

function renderCart() {
    const container = document.querySelector('.productCards');
    if (!container) return;

    if (!cartItems.length) {
        renderCartEmpty();
        return;
    }

    const cartWithProducts = cartItems.map(cartItem => {
        const product = allProducts.find(p => p.id === cartItem.productId);
        return { ...cartItem, product: product || null };
    }).filter(item => item.product !== null);

    if (cartWithProducts.length === 0) {
        container.innerHTML = '<div class="empty-message">Нет доступных товаров в корзине.</div>';
        return;
    }

    let html = '';
    cartWithProducts.forEach(item => {
        const product = item.product;
        const totalPerItem = product.sailPrice * item.quantity;
        html += `
            <div class="cart-card" data-cart-id="${item.id}" data-product-id="${product.id}">
                <div class="cart-card-image">
                    <img src="${product.image}" alt="${escapeHtml(product.name)}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
                </div>
                <div class="cart-card-info">
                    <div class="cart-card-name">${escapeHtml(product.name)}</div>
                    <div class="cart-card-price">
                        <span class="price-old">${formatPrice(product.price)} руб.</span>
                        <span class="price-sale">${formatPrice(product.sailPrice)} руб.</span>
                    </div>
                    <div class="cart-card-quantity">
                       <button type="button" class="quantity-btn minus" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button type="button" class="quantity-btn plus" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-card-total">Итого: ${formatPrice(totalPerItem)} руб.</div>
                    <button type="button" class="cart-remove-btn" data-id="${item.id}">Удалить</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    const totalSum = calculateTotal();
    let summaryDiv = document.querySelector('.cart-summary');
    if (!summaryDiv) {
        summaryDiv = document.createElement('div');
        summaryDiv.className = 'cart-summary';
        container.parentNode.insertBefore(summaryDiv, container.nextSibling);
    }
    summaryDiv.innerHTML = `
        <div class="cart-summary-content">
            <div class="total-amount">Общая сумма: ${formatPrice(totalSum)} руб.</div>
            <button type="button" class="checkout-btn">Оформить заказ</button>
            <button type="button" class="clear-cart-btn">Очистить корзину</button>
        </div>
    `;

    attachCartEvents();
    updateCartCounter();
}

async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) return;
    try {
        const response = await fetch(`${API_BASE}/cart/${cartId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });
        if (!response.ok) throw new Error('Ошибка обновления количества');
        const updated = await response.json();
        const index = cartItems.findIndex(item => item.id === cartId);
        if (index !== -1) cartItems[index].quantity = updated.quantity;

        updateCartItemCard(cartId);
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        alert('Не удалось изменить количество');
    }
}

async function removeFromCart(cartId) {
    try {
        const response = await fetch(`${API_BASE}/cart/${cartId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ошибка удаления');
        cartItems = cartItems.filter(item => item.id !== cartId);
        removeCartItemCard(cartId);
    } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Не удалось удалить товар');
    }
}

async function clearCart() {
    if (!confirm('Вы уверены, что хотите очистить корзину?')) return;
    try {
        const deletePromises = cartItems.map(item => fetch(`${API_BASE}/cart/${item.id}`, { method: 'DELETE' }));
        await Promise.all(deletePromises);
        cartItems = [];
        renderCart();
    } catch (error) {
        console.error('Ошибка при очистке корзины:', error);
        alert('Не удалось очистить корзину');
    }
}

function checkout() {
    if (cartItems.length === 0) {
        alert('Корзина пуста. Добавьте товары для оформления заказа.');
        return;
    }
    alert('Спасибо за заказ! Наш менеджер свяжется с вами в ближайшее время.');
}

function attachCartEvents() {
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.removeEventListener('click', minusHandler);
        btn.addEventListener('click', minusHandler);
    });
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.removeEventListener('click', plusHandler);
        btn.addEventListener('click', plusHandler);
    });
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.removeEventListener('change', quantityChangeHandler);
        input.addEventListener('change', quantityChangeHandler);
    });
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.removeEventListener('click', removeHandler);
        btn.addEventListener('click', removeHandler);
    });
    const clearBtn = document.querySelector('.clear-cart-btn');
    if (clearBtn) {
        clearBtn.removeEventListener('click', clearCart);
        clearBtn.addEventListener('click', clearCart);
    }
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.removeEventListener('click', checkout);
        checkoutBtn.addEventListener('click', checkout);
    }
}

function minusHandler(e) {
    e.preventDefault(); 
    const cartId = e.currentTarget.getAttribute('data-id');
    const currentItem = cartItems.find(item => item.id === cartId);

    if (currentItem && currentItem.quantity > 1) {
        updateQuantity(cartId, currentItem.quantity - 1);
    } else if (currentItem && currentItem.quantity === 1) {
        if (confirm('Удалить товар из корзины?')) {
            removeFromCart(cartId);
        }
    }
}

function plusHandler(e) {
    e.preventDefault(); 
    const cartId = e.currentTarget.getAttribute('data-id');
    const currentItem = cartItems.find(item => item.id === cartId);

    if (currentItem) {
        updateQuantity(cartId, currentItem.quantity + 1);
    }
}

function quantityChangeHandler(e) {
    const input = e.currentTarget;
    const cartId = input.getAttribute('data-id');
    let newVal = parseInt(input.value, 10);
    if (isNaN(newVal)) newVal = 1;
    newVal = Math.max(1, newVal);
    updateQuantity(cartId, newVal);
}

function removeHandler(e) {
    const cartId = e.currentTarget.getAttribute('data-id');
    if (confirm('Удалить товар из корзины?')) {
        removeFromCart(cartId);
    }
}

async function initCart() {
    try {
        const [products, cart] = await Promise.all([fetchProducts(), fetchCart()]);
        allProducts = products;
        cartItems = cart;
        renderCart();
        updateCartCounter();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        alert('Не удалось загрузить корзину. Убедитесь, что json-server запущен.');
    }
}

document.addEventListener('DOMContentLoaded', initCart);