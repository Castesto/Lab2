const API_BASE = 'http://localhost:3000';

const generateNicknameBtn = document.querySelector('.generate-nickname');

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


async function init() {
    await loadUsers();          
    generateNicknameBtn.addEventListener('click', createNickByName);
}

init();