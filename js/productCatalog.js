const originalProducts = [
    { id: "1", image: "images/Кровать 5.png", type: "bed", name: "Кровать двуспальная «Комфорт»", price: "8990", sailPrice: "7192" },
    { id: "2", image: "images/Диван угловой Комфорт.jpg", type: "sofa", name: "Диван угловой «Модерн»", price: "12500", sailPrice: "10500" },
    { id: "3", image: "images/Стол обеденный Дуб.png", type: "table", name: "Стол обеденный «Дуб»", price: "5430", sailPrice: "4890" },
    { id: "4", image: "images/Кресло Элегант.jpg", type: "chair", name: "Кресло «Элегант»", price: "7200", sailPrice: "6500" },
    { id: "5", image: "images/Шкаф-купе.jpg", type: "wardrobe", name: "Шкаф-купе «Практик»", price: "13400", sailPrice: "11800" },
    { id: "6", image: "images/Детская кровть Сказка.jpg", type: "bed", name: "Кровать детская «Сказка»", price: "6200", sailPrice: "5580" },
    { id: "7", image: "images/Диван прямой Люкс.jpg", type: "sofa", name: "Диван прямой «Люкс»", price: "9600", sailPrice: "8640" },
    { id: "8", image: "images/Стол журнальный глянец.jpg", type: "table", name: "Стол журнальный «Глянец»", price: "3800", sailPrice: "3420" },
    { id: "9", image: "images/Тумба прикроватная Светлана.webp", type: "cabinet", name: "Тумба прикроватная «Светлана»", price: "3200", sailPrice: "2560" },
    { id: "10", image: "images/Стул мягкий Венге.jpg", type: "chair", name: "Стул мягкий «Венге»", price: "2100", sailPrice: "1680" },
    { id: "11", image: "images/Барный стул метталик.webp", type: "chair", name: "Барный стул «Металлик»", price: "4300", sailPrice: "3440" },
    { id: "12", image: "images/стол письменный деловой.webp", type: "table", name: "Стол письменный «Деловой»", price: "7850", sailPrice: "6280" },
    { id: "13", image: "images/крело-качалка Винтаж.webp", type: "chair", name: "Кресло-качалка «Винтаж»", price: "11200", sailPrice: "8960" },
    { id: "14", image: "images/Комод белый.webp", type: "wardrobe", name: "Комод «Белый»", price: "6900", sailPrice: "5520" },
    { id: "15", image: "images/Вешалка напольная италия.webp", type: "other", name: "Вешалка напольная «Италия»", price: "2450", sailPrice: "1960" }
];



let currentDisplayedProducts = [...originalProducts];
let currentSearchTerm = '';

const extraDemoProduct = {
    id: "concat_demo",
    image: "images/Кровать 5.png",
    type: "special",
    name: "тестовая новинка",
    price: "9900",
    sailPrice: "7900"
};

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

function buyHandler(e) {
    const button = e.currentTarget;
    const productId = button.getAttribute('data-id');
    const product = currentDisplayedProducts.find(p => p.id === productId);
    if (product) {
        console.log(`[Корзина] ${product.name}`);
        alert(`Товар "${product.name}" добавлен в корзину!`);
    } else {
        alert(`Товар добавлен (ID: ${productId})`);
    }
}

function likeHandler(e) {
    e.stopPropagation();
    const likeDiv = e.currentTarget;
    likeDiv.classList.toggle('active');
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
                <div class="like">
                    <img src="images/like.png" alt="like">
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    attachEventsToCurrentCards();
}

function filterLowPrice() {
    return originalProducts.filter(p => Number(p.sailPrice) < 5500);
}

function filterSofaOnly() {
    return originalProducts.filter(p => p.type === 'sofa');
}

function mapIncreasePrice() {
    return originalProducts.map(p => ({
        ...p,
        price: Math.round(Number(p.price) * 1.15).toString(),
        sailPrice: Math.round(Number(p.sailPrice) * 1.15).toString(),
        name: `${p.name} +15%`
    }));
}

function sortByPriceAsc() {
    return [...originalProducts].sort((a, b) => Number(a.price) - Number(b.price));
}

function sortBySaleDesc() {
    return [...originalProducts].sort((a, b) => Number(b.sailPrice) - Number(a.sailPrice));
}

function reduceMaxPriceProduct() {
    if (!originalProducts.length) return [];
    const maxProduct = originalProducts.reduce((max, curr) =>
        Number(curr.price) > Number(max.price) ? curr : max, originalProducts[0]);
    return [maxProduct];
}

function sliceFirstFour() {
    return originalProducts.slice(0, 4);
}

function findChairProduct() {
    const found = originalProducts.find(p => p.name.toLowerCase().includes('кресло'));
    return found ? [found] : [];
}

function concatWithExtra() {
    return originalProducts.concat(extraDemoProduct);
}

function reverseOrder() {
    return [...originalProducts].reverse();
}

function resetToAll() {
    return [...originalProducts];
}

function updateCatalog(getProductArrayFn) {
    renderProducts(getProductArrayFn());
}

function filterBySearch(searchTerm) {
    if (!searchTerm.trim()) return [...originalProducts];
    const term = searchTerm.toLowerCase().trim();
    return originalProducts.filter(product =>
        product.name.toLowerCase().includes(term)
    );
}

function searchBox() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value; 
        updateCatalogWithSort();   
    });
}

function bindMethodButtons() {
    document.getElementById('filterLowPrice')?.addEventListener('click', () => updateCatalog(filterLowPrice));
    document.getElementById('filterSofa')?.addEventListener('click', () => updateCatalog(filterSofaOnly));
    document.getElementById('mapIncreasePrice')?.addEventListener('click', () => updateCatalog(mapIncreasePrice));
    document.getElementById('sortPriceAsc')?.addEventListener('click', () => updateCatalog(sortByPriceAsc));
    document.getElementById('sortSaleDesc')?.addEventListener('click', () => updateCatalog(sortBySaleDesc));
    document.getElementById('reduceMaxPrice')?.addEventListener('click', () => updateCatalog(reduceMaxPriceProduct));
    document.getElementById('sliceFirstFour')?.addEventListener('click', () => updateCatalog(sliceFirstFour));
    document.getElementById('findChair')?.addEventListener('click', () => updateCatalog(findChairProduct));
    document.getElementById('concatNewItem')?.addEventListener('click', () => updateCatalog(concatWithExtra));
    document.getElementById('reverseOrder')?.addEventListener('click', () => updateCatalog(reverseOrder));
    document.getElementById('resetAll')?.addEventListener('click', () => updateCatalog(resetToAll));
}


const sortSelect = document.getElementById('sortingSelect');
const productCountSpan = document.getElementById('productCount');

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
    const filtered = filterBySearch(currentSearchTerm);
    const sortType = sortSelect ? sortSelect.value : 'default';
    const sorted = sortProducts(filtered, sortType);
    renderProducts(sorted);
    if (productCountSpan) {
        productCountSpan.innerText = sorted.length;
    }
}

if (sortSelect) {
    sortSelect.addEventListener('change', updateCatalogWithSort);
}


document.addEventListener('DOMContentLoaded', () => {
    bindMethodButtons();
    renderProducts([...originalProducts]);
    searchBox();
});