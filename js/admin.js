const API_BASE = 'http://localhost:3000';


let addButton = document.querySelector('.addProduct');
const form = document.getElementById('addProductForm');
const imageInput = document.getElementById('imageInput');
const imagePathInput = document.getElementById('imagePathInput');



function isAdmin() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin';
}

if (isAdmin() === false) {
    document.location.href = "/";
}


imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        imagePathInput.value = 'images/' + file.name;
    }
});


function addButtonEvent() {
    allSections = document.querySelectorAll('.eventSection');
    currentSection = document.querySelector('.addEvent');

    allSections.forEach(section => {
        section.style.display = 'none';
    });

    currentSection.style.display = 'block';

}





function collectFormData() {
    const form = document.getElementById('addProductForm');
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());
    userData.image = document.getElementById('imagePathInput').value;

    return userData;
}

async function onFormSubmit(event) {
    event.preventDefault();

    const userData = collectFormData();
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const newProduct = await response.json();
            alert(`Товар успешно добавлен`);
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


async function init() {
    form.addEventListener('submit', onFormSubmit);
    addButton.addEventListener('click', addButtonEvent);
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});