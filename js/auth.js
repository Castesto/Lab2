window.updateAuthButtons = function checkCurrentAutorization() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
        const autorizationRef = document.querySelector('.contacts');
        const registrationRef = document.querySelector('.our-work');
        if (autorizationRef && autorizationRef.firstChild) {
            autorizationRef.firstChild.textContent = 'Выйти';
        }
        if (registrationRef && registrationRef.firstChild) {
            registrationRef.firstChild.textContent = 'Профиль';
        }
    }
}