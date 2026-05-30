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


function isAdmin() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin';
}

if (isAdmin() === true) {
    document.location.href = '/';
}

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


// ... существующий код (API_BASE, isAdmin, getCurrentUser и т.д.) ...

// --- Новый код для редактирования профиля ---
let currentUserId = null;

async function loadCurrentUserData() {
    const nickName = getCurrentUser();
    if (!nickName) return;

    try {
        const response = await fetch(`${API_BASE}/users?nickName=${nickName}`);
        const users = await response.json();
        if (users.length === 0) return;
        const user = users[0];
        currentUserId = user.id;

        document.getElementById('editNickname').value = user.nickName || '';
        document.getElementById('editEmail').value = user.email || '';
        // поля пароля остаются пустыми
    } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err);
    }
}

async function isNicknameUniqueExceptCurrent(nickname) {
    try {
        const response = await fetch(`${API_BASE}/users?nickName=${nickname}`);
        const users = await response.json();
        if (users.length === 0) return true;
        // если нашелся пользователь с таким ником, но это текущий – разрешаем
        return users[0].id === currentUserId;
    } catch {
        return false;
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();

    const newNick = document.getElementById('editNickname').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    const newPassword = document.getElementById('editPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;

    // Сброс сообщений об ошибках
    document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
    document.getElementById('profileEditMessage').innerHTML = '';

    let isValid = true;
    // Проверка ника
    if (!newNick) {
        showFieldError('nickname', 'Ник не может быть пустым');
        isValid = false;
    } else {
        const isUnique = await isNicknameUniqueExceptCurrent(newNick);
        if (!isUnique) {
            showFieldError('nickname', 'Этот ник уже занят');
            isValid = false;
        }
    }
    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showFieldError('email', 'Введите корректный email');
        isValid = false;
    }
    // Проверка пароля (если заполнен хотя бы один из двух полей)
    if (newPassword || confirmPassword) {
        if (newPassword !== confirmPassword) {
            showFieldError('password', 'Пароли не совпадают');
            isValid = false;
        } else if (newPassword.length < 8) {
            showFieldError('password', 'Пароль должен содержать минимум 8 символов');
            isValid = false;
        }
    }

    if (!isValid) return;

    // Формируем объект для обновления
    const updateData = { nickName: newNick, email: newEmail };
    if (newPassword) {
        updateData.password = newPassword;
    }

    try {
        const response = await fetch(`${API_BASE}/users/${currentUserId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        if (response.ok) {
            const updatedUser = await response.json();
            // Обновляем localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            // Если сменился ник – обновляем кнопки в шапке
            if (typeof window.updateAuthButtons === 'function') window.updateAuthButtons();
            document.getElementById('profileEditMessage').innerHTML = '<span style="color:green;">✅ Данные успешно обновлены</span>';
            // Очистить поля пароля
            document.getElementById('editPassword').value = '';
            document.getElementById('editConfirmPassword').value = '';
            // Необязательно: перезагрузить данные для отображения
            await loadCurrentUserData();
        } else {
            throw new Error('Ошибка сервера');
        }
    } catch (err) {
        document.getElementById('profileEditMessage').innerHTML = '<span style="color:red;">❌ Не удалось сохранить изменения</span>';
        console.error(err);
    }
}

function showFieldError(field, message) {
    let selector = '';
    if (field === 'nickname') selector = '.nickname-error-message';
    else if (field === 'email') selector = '.email-error-message';
    else if (field === 'password') selector = '.password-error-message';
    const errorDiv = document.querySelector(selector);
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// --- Инициализация после загрузки DOM ---
document.addEventListener('DOMContentLoaded', async () => {
    // Существующая инициализация (profile.js)
    const userNick = getCurrentUser();
    if (!userNick) {
        window.location.href = '/avtorization.html';
        return;
    }
    if (isAdmin()) {
        window.location.href = '/';
        return;
    }
    await getBuyStoryForCurrentUser();
    storyProducts = await getStoryCards();
    renderStoryCards(storyProducts);

    // Новое: загрузка данных для формы редактирования
    await loadCurrentUserData();
    const editForm = document.getElementById('editProfileForm');
    if (editForm) editForm.addEventListener('submit', handleProfileSubmit);
});


async function init() {
    getBuyStoryForCurrentUser();
    storyProducts = await getStoryCards();
    renderStoryCards(storyProducts);
}



document.addEventListener('DOMContentLoaded', () => {
    init();
});