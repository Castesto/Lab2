window.updateAuthButtons = function checkCurrentAutorization() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    const autorizationAnchor = document.querySelector('.contacts a');
    const registrationAnchor = document.querySelector('.our-work a');

    if (savedUser) {
        if (autorizationAnchor) {
            // mark as logout action; text comes from translations
            autorizationAnchor.dataset.action = 'logout';
            autorizationAnchor.setAttribute('href', 'javascript:void(0)');
            autorizationAnchor.setAttribute('data-i18n', 'nav.logout');
        }
        if (registrationAnchor) {
            registrationAnchor.dataset.action = 'profile';
            if (isAdmin()) {
                registrationAnchor.setAttribute('href', '/admin.html');
            } else {
                registrationAnchor.setAttribute('href', '/profile.html');
            }
            registrationAnchor.setAttribute('data-i18n', 'nav.profile');
        }
    } else {
        if (autorizationAnchor) {
            autorizationAnchor.removeAttribute('data-action');
            autorizationAnchor.setAttribute('href', 'avtorization.html');
            autorizationAnchor.setAttribute('data-i18n', 'nav.login');
        }
        if (registrationAnchor) {
            registrationAnchor.removeAttribute('data-action');
            registrationAnchor.setAttribute('href', 'registration.html');
            registrationAnchor.setAttribute('data-i18n', 'nav.register');
        }
    }

    // re-run translator to apply the proper labels (if i18n is loaded)
    try { if (typeof translatePage === 'function') translatePage(); } catch (e) {}
}

function isAdmin() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin';
}

function setupLogoutHandler() {
    document.body.addEventListener('click', (event) => {
        const link = event.target.closest('.contacts a, .contacts');
        if (!link) return;
        const anchor = event.target.closest('.contacts a');
        if (anchor && anchor.dataset.action === 'logout') {
            event.preventDefault();
            logout();
        }
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    updateAuthButtons();
    window.location.href = '/';
}


document.addEventListener('DOMContentLoaded', () => {
    setupLogoutHandler();
    updateAuthButtons();
});

// Also ensure auth buttons are updated after components are inserted and translated
document.addEventListener('componentsTranslated', () => {
    setupLogoutHandler();
    updateAuthButtons();
});