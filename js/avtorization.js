const API_BASE = 'http://localhost:3000';

const registerBtn = document.querySelector('.registered');
const form = document.getElementById('registrationform');

let allUsers = [];

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
}

async function init() {
    await loadUsers();
    form.addEventListener('submit', onFormSubmit);

}

init();

