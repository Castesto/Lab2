const API_BASE = 'http://localhost:3000';

let allProducts = [];
let storyProducts = [];
let currentUser;

const modal = document.getElementById('reviewModal');
const reviewTextarea = document.getElementById('reviewText');
const charCount = document.getElementById('charCount');
const submitBtn = document.getElementById('submitReview');
const closeBtn = document.getElementById('closeReviewModal');

let currentProductId = null;

function getCurrentUser() {
    let user = JSON.parse(localStorage.getItem('currentUser'));

    if (user) {
        return user.nickName;
    }
    else {
        return null;
    }
}

currentUser = getCurrentUser();

async function getBuyStoryForCurrentUser() {
    const nickName = currentUser;
    const responce = await fetch(`${API_BASE}/users?nickName=${nickName}`);
    const users = await responce.json();
    const user = users[0];

    let buyStory = user.purchaseHistory;

    return buyStory;
}




async function getStoryCards() {
    let storyIds = await getBuyStoryForCurrentUser();
    const responce = await fetch(`${API_BASE}/products`);
    const allProducts = await responce.json();

    return allProducts.filter(prod => storyIds.includes(prod.id));
}

async function renderStoryCards(products) {
    const container = document.querySelector('.reviews');
    container.innerHTML = '';

    products.forEach(product => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review';

        reviewDiv.innerHTML = `
            <div data-id="${product.id}" class="photo">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="name">${product.name}</div>
            <button class="printReview">Оставить отзыв</button>
        `;

        const btn = reviewDiv.querySelector('.printReview');
        btn.addEventListener('click', () => {
            openReviewModal(product.id, product.name);
        });

        container.appendChild(reviewDiv);
    });
}

function openReviewModal(productId, productName) {
    currentProductId = productId;
    document.querySelector('.modal-content h3').textContent = `Отзыв: ${productName}`;
    reviewTextarea.value = '';
    charCount.textContent = `0 / ${reviewTextarea.maxLength}`;
    modal.classList.add('active');
}

function closeReviewModal() {
    modal.classList.remove('active');
    currentProductId = null;
}


closeBtn.addEventListener('click', closeReviewModal);

reviewTextarea.addEventListener('input', () => {
    const len = reviewTextarea.value.length;
    charCount.textContent = `${len} / ${reviewTextarea.maxLength}`;
});


submitBtn.addEventListener('click', () => {
    const text = reviewTextarea.value.trim();
    if (!text) {
        alert('Введите текст отзыва');
        return;
    }

    sumbitReview(currentProductId, text);

    alert('Спасибо за отзыв!');
    closeReviewModal();
});

async function sumbitReview(productId, text) {
    const responce = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nickName: currentUser,
            review: text,
            productId: productId,
            date: new Date().toISOString()
        })
    }
    )
}


async function init() {
    getBuyStoryForCurrentUser();
    storyProducts = await getStoryCards();
    renderStoryCards(storyProducts);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});