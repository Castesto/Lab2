const API_BASE = 'http://localhost:3000';

const registerBtn = document.querySelector('.registered');
const form = document.getElementById('registrationform');

let allUsers = [];
let formData;
let nick;
let password;
let currentUser;

async function loadUsers() {
    const responce = await fetch(API_BASE + '/users');
    const data = await responce.json();
    allUsers = [...data];
}

async function onFormSubmit(event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    formData = new FormData(form);
    nick = formData.get('nickName');
    password = formData.get('password');

    currentUser = searchUser(nick, password);

    if (currentUser != undefined) {
        console.log(currentUser);
        await clearCartViaAction();
        saveCurrentUser(currentUser);
    }
    else {
        alert('Нет пользователя с такими даннми')
        console.log('нету такого');
    }
}

function searchUser(nickName, password) {
    let currentUser = allUsers.find(
        user => ((user.nickName === nickName) &&
            (user.password === password)));

    return currentUser;
}


function saveCurrentUser(currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.location.href = '/';
    console.log('Авторизация успешна');
}

async function clearCartViaAction() {
    try {
        const getResponse = await fetch(`${API_BASE}/cart`);
        if (!getResponse.ok) throw new Error(`GET error: ${getResponse.status}`);
        const cartItems = await getResponse.json();

        const deletePromises = cartItems.map(item =>
            fetch(`${API_BASE}/cart/${item.id}`, { method: 'DELETE' })
        );
        await Promise.all(deletePromises);

        console.log('Корзина очищена, удалено элементов:', cartItems.length);
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
    }
}




async function init() {
    await loadUsers();
    form.addEventListener('submit', onFormSubmit);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});