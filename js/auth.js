window.updateAuthButtons = function checkCurrentAutorization() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const autorizationRef = document.querySelector('.contacts');
    const registrationRef = document.querySelector('.our-work');

    if (savedUser) {
        if (autorizationRef && autorizationRef.firstChild) {
            autorizationRef.firstChild.textContent = 'Выйти';
            autorizationRef.firstChild.href = 'javascript:void(0)';
        }
        if (registrationRef && registrationRef.firstChild) {
            registrationRef.firstChild.textContent = 'Профиль';
            if (isAdmin()) {
                registrationRef.firstChild.href = '/admin.html';
            }
            else {
                registrationRef.firstChild.href = '/profile.html';
            }
        }
    }
    else {
        if (autorizationRef?.firstChild) {
            autorizationRef.firstChild.textContent = 'Авторизация';
            autorizationRef.firstChild.href = 'avtorization.html';
        }
        if (registrationRef?.firstChild) {
            registrationRef.firstChild.textContent = 'Регистрация';
            registrationRef.firstChild.href = 'registration.html';
        }
    }
}

function isAdmin() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin';
}

function setupLogoutHandler() {
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.contacts a');
        if (!link) return;
        const text = link.textContent.trim();
        if (text === 'Выйти') {
            event.preventDefault();
            logout();
        }
    });
}




function logout() {
    localStorage.removeItem('currentUser');
    updateAuthButtons();
}


document.addEventListener('DOMContentLoaded', () => {
    setupLogoutHandler();
    updateAuthButtons();
});