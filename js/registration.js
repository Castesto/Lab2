const API_BASE = 'http://localhost:3000';

const generateNicknameBtn = document.querySelector('.generate-nickname');
const generatePasswordBtn = document.querySelector('.generate-password')

let allUsers = [];


async function loadUsers() {
    const responce = await fetch(API_BASE + '/users');
    const data = await responce.json();
    allUsers = [...data];
}

async function createNickByName() {
    let nameText = document.querySelector('#nameInput').value.trim();
    let nicknameInput = document.querySelector('#nicknameInput');

    if (nameText.length === 0) {
        nameText = 'Mister';
    }
    
    let nextNumber = 1;
    
    while (await checkExistenceNickName(nameText + nextNumber)) {
        nextNumber++;
    }

    nicknameInput.value = nameText + nextNumber.toString();
}

async function checkExistenceNickName(userNickName) {
    return allUsers.some(user => user.nickName === userNickName);
}

async function generatePassword() {
    const passwordInput = document.querySelector('.passwordInput');
    const secondPasswordInput = document.querySelector('.secondPasswordInput');

    const r = (s) => s[Math.floor(Math.random() * s.length)];
    const sets = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "0123456789", "!@#$%^&*"];
    let pass = sets.map(r).join('');
    while(pass.length < 8) pass += r(sets[0]);
    let finalPass = (pass.split('').sort(() => Math.random() - 0.5).join(''));

    passwordInput.value = finalPass;
    secondPasswordInput.value = finalPass;
}





async function init() {
    await loadUsers();          
    generateNicknameBtn.addEventListener('click', createNickByName);
    generatePasswordBtn.addEventListener('click', generatePassword);


}

init();