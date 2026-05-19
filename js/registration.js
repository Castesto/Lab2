const API_BASE = 'http://localhost:3000';

const generateNicknameBtn = document.querySelector('.generate-nickname');
const generatePasswordBtn = document.querySelector('.generate-password')
const form = document.getElementById('registrationform');
const registerBtn = document.querySelector('.registered');
const passwordInput = document.querySelector('#passwordInput');
const confirmInput = document.querySelector('.secondPasswordInput');
const errorNickDiv = document.querySelector('.errorNickMessage');

errorNickDiv.style.display = 'none';
errorNickDiv.style.fontSize = '12px';
errorNickDiv.style.marginTop = '5px';
errorNickDiv.style.color = 'red';

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
    while (pass.length < 8) pass += r(sets[0]);
    let finalPass = (pass.split('').sort(() => Math.random() - 0.5).join(''));

    passwordInput.value = finalPass;
    secondPasswordInput.value = finalPass;
}

function validateAge() {
    const birthdate = document.getElementById('birthdate').value;
    if (!birthdate) return false;

    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassed = (today.getMonth() > birthDate.getMonth()) ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassed) age--;

    return age >= 16;
}


document.getElementById('registrationform').addEventListener('submit', function (e) {
    if (!validateAge()) {
        e.preventDefault();
        alert('Регистрация доступна только пользователям старше 16 лет');
    }
});


function collectFormData() {
    const form = document.getElementById('registrationform');
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());

    delete userData.agreement;
    delete userData.confirmPassword;

    return userData;
}

async function isNicknameUnique(nick) {
    const response = await fetch(`${API_BASE}/users`);
    const users = await response.json();
    return !users.some(user => user.nickName === nick);
}

const nicknameInput = document.querySelector('#nicknameInput');
const nicknameError = document.createElement('div');


let debounceTimer;
async function checkNicknameAvailability() {
    const nick = nicknameInput.value.trim();

    if (nick.length === 0) {
        errorNickDiv.style.display = 'none';
        nicknameInput.style.borderColor = '';
        nicknameInput.setCustomValidity('');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        const isTaken = users.some(user => user.nickName === nick);

        if (isTaken) {
            errorNickDiv.textContent = 'Никнейм уже занят';
            errorNickDiv.style.color = 'red';
            errorNickDiv.style.display = 'flex';
            nicknameInput.style.borderColor = 'red';
            errorNickDiv.style.marginTop = '-15px'
            nicknameInput.setCustomValidity('Никнейм занят');
        } else {
            errorNickDiv.textContent = 'Никнейм свободен';
            errorNickDiv.style.color = 'green';
            errorNickDiv.style.display = 'flex';
            errorNickDiv.style.marginTop = '-15px'
            nicknameInput.style.borderColor = 'green';
            nicknameInput.setCustomValidity('');
        }
    } catch (err) {
        console.error('Ошибка при проверке ника:', err);
        errorNickDiv.textContent = '⚠️ Ошибка проверки';
        errorNickDiv.style.color = 'orange';
        errorNickDiv.style.display = 'flex';
    }
}

nicknameInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkNicknameAvailability, 500);
});

nicknameInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkNicknameAvailability, 500);
});


async function handleRegistration() {
    const userData = collectFormData();

    const isUnique = await isNicknameUnique(userData.nickName);
    if (!isUnique) {
        alert('Никнейм уже занят. Используйте другой.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const newUser = await response.json();
            alert(`Регистрация успешна! Добро пожаловать, ${newUser.nickName}`);
            form.reset();
        } else {
            const error = await response.json();
            alert(`Ошибка сервера: ${error.message || 'попробуйте позже'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Не удалось соединиться с сервером. Запустите json-server');
    }
}

async function onFormSubmit(event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!validateAge()) {
        alert('Регистрация доступна только пользователям старше 16 лет');
        return;
    }

    const nick = document.querySelector('#nicknameInput').value.trim();
    const isUnique = await isNicknameUnique(nick);
    if (!isUnique) {
        alert('Никнейм уже занят. Используйте другой.');
        return;
    }

    const userData = collectFormData();
    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const newUser = await response.json();
            alert(`Регистрация успешна! Добро пожаловать, ${newUser.nickName}`);
            form.reset();
            document.querySelector('#nicknameInput').style.borderColor = '';
            errorNickDiv.style.display = 'none';
        } else {
            const error = await response.json();
            alert(`Ошибка сервера: ${error.message || 'попробуйте позже'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Не удалось соединиться с сервером. Запустите json-server');
    }
}

registerBtn.disabled = true;

function updateButtonState() {
    const isFormValid = form.checkValidity();
    if (isFormValid) {
        registerBtn.disabled = false;
    }
    else{
        console.log('нельзя регистрироваться');

    }
}


async function init() {
    await loadUsers();
    generateNicknameBtn.addEventListener('click', createNickByName);
    generatePasswordBtn.addEventListener('click', generatePassword);
    form.addEventListener('submit', onFormSubmit);
    let debounceTimer;
    nicknameInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(checkNicknameAvailability, 500); 
    });

    form.addEventListener('input', updateButtonState);
}

init();