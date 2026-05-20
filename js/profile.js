const API_BASE = 'http://localhost:3000';

let allProducts = [];
let storyProducts = [];
let currentUser;

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
    const responce = await fetch (`${API_BASE}/products`);
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
            console.log('Товар:', product.name, 'ID:', product.id);
        });

        container.appendChild(reviewDiv);
    });
}

// getStoryCards().then(array => {
//   console.log(array);
// });



async function init() {
    getBuyStoryForCurrentUser();
    storyProducts = await getStoryCards();
    renderStoryCards(storyProducts);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});