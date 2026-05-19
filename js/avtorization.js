const API_BASE = 'http://localhost:3000';

const registerBtn = document.querySelector('.registered');
const form = document.getElementById('registrationform');
// const autorizationRef = document.querySelector('.contacts');
// const registrationRef = document.querySelector('.our-work');

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
        saveCurrentUser(currentUser);
    }
    else {
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
    console.log('Авторизация успешна');
}


async function init() {
    await loadUsers();
    form.addEventListener('submit', onFormSubmit);
    
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});