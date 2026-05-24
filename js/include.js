async function includeComponents() {
    const headerElement = document.querySelector('header');
    if (headerElement) {
        const response = await fetch('/components/header.html');
        const headerContent = await response.text();
        headerElement.innerHTML = headerContent;

        if (typeof window.updateAuthButtons === 'function') {
            window.updateAuthButtons();
        }
    }

    const footerElement = document.querySelector('footer');
    if (footerElement) {
        const response = await fetch('/components/footer.html');
        const footerContent = await response.text();
        footerElement.innerHTML = footerContent;
    }
}


window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(function () {
            preloader.style.display = 'none';
        }, 300);
    }
});


function showNotification(message, type = 'success') {
    const oldToast = document.querySelector('.custom-toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = `custom-toast custom-toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</div>
        <div class="toast-message">${message}</div>
    `;

    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .custom-toast {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                padding: 14px 24px;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                font-family: 'PT Sans', sans-serif;
                font-size: 16px;
                max-width: 350px;
                border-left: 5px solid;
            }
            .custom-toast-success { border-left-color: #28a745; }
            .custom-toast-error { border-left-color: #dc3545; }
            .custom-toast-info { border-left-color: #17a2b8; }
            .toast-icon { font-size: 22px; }
            .toast-message { color: #333; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                to { opacity: 0; visibility: hidden; }
            }
            @media (max-width: 576px) {
                .custom-toast { bottom: 20px; right: 20px; left: 20px; max-width: none; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

window.closeModal = function (modalElement) {
    if (modalElement) modalElement.classList.remove('active');
};

document.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal-overlay');
    if (modal && (e.target === modal || e.target.classList.contains('modal-close'))) {
        closeModal(modal);
    }
});



function initBurgerMenu() {
    const burger = document.querySelector('.burger-menu');
    if (!burger) return;

    let overlay = document.querySelector('.mobile-menu-overlay');
    let panel = document.querySelector('.mobile-menu-panel');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'mobile-menu-panel';
        document.body.appendChild(panel);
    }

    function populateMenu() {
        panel.innerHTML = '';
        const content = document.createElement('div');

        const header1 = document.querySelector('.header1 ul');
        if (header1) {
            const navUl = document.createElement('ul');
            header1.querySelectorAll('li').forEach(li => {
                const a = li.querySelector('a');
                if (a) {
                    const newLi = document.createElement('li');
                    const newA = a.cloneNode(true);
                    newA.addEventListener('click', closeMenu);
                    newLi.appendChild(newA);
                    navUl.appendChild(newLi);
                }
            });
            content.appendChild(navUl);
        }

        const specialDiv = document.createElement('div');
        specialDiv.className = 'mobile-special-links';

        const favLink = document.createElement('a');
        favLink.href = '/favorites.html';
        favLink.innerHTML = '<div style="font-weight: bold; display: inline-block;">❤️ Избранное</div>';
        favLink.addEventListener('click', closeMenu);
        specialDiv.appendChild(favLink);

        const cartLink = document.createElement('a');
        cartLink.href = '/cart.html';
        const cartCountSpan = document.querySelector('#cartCount');
        const cartCount = cartCountSpan ? cartCountSpan.innerText : '0';
        cartLink.innerHTML = `<div style="font-weight: bold; display: inline-block;">🛒 Корзина [${cartCount}]</div>`;
        cartLink.addEventListener('click', closeMenu);
        specialDiv.appendChild(cartLink);

        content.appendChild(specialDiv);

        const header3 = document.querySelector('.header3');
        if (header3) {
            const catUl = document.createElement('ul');
            header3.querySelectorAll('.header3 > div').forEach(div => {
                const a = div.querySelector('a');
                if (a) {
                    const newLi = document.createElement('li');
                    const newA = a.cloneNode(true);
                    newA.addEventListener('click', closeMenu);
                    newLi.appendChild(newA);
                    catUl.appendChild(newLi);
                }
            });
            content.appendChild(catUl);
        }

        const phone = document.querySelector('.phoneNumber .number');
        if (phone) {
            const phoneDiv = document.createElement('div');
            phoneDiv.className = 'mobile-phone';
            phoneDiv.innerHTML = phone.innerHTML;
            content.appendChild(phoneDiv);
        }

        panel.appendChild(content);
    }

    function openMenu() {
        populateMenu();
        overlay.classList.add('active');
        panel.classList.add('active');
        burger.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        overlay.classList.remove('active');
        panel.classList.remove('active');
        burger.classList.remove('active');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (panel.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('active')) {
            closeMenu();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        includeComponents().then(() => initBurgerMenu());
    });
} else {
    includeComponents().then(() => initBurgerMenu());
}

document.addEventListener('DOMContentLoaded', includeComponents);  