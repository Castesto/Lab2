async function includeComponents() {
    const headerElement = document.querySelector('header');
    if (headerElement) {
        const response = await fetch('/components/header.html');
        const headerContent = await response.text();
        headerElement.innerHTML = headerContent;

        if (typeof window.updateAuthButtons === 'function') {
            window.updateAuthButtons();
        }
        try { document.dispatchEvent(new Event('componentsIncluded')); } catch (e) { /* ignore */ }
    }

    const footerElement = document.querySelector('footer');
    if (footerElement) {
        const response = await fetch('/components/footer.html');
        const footerContent = await response.text();
        footerElement.innerHTML = footerContent;
        try { document.dispatchEvent(new Event('componentsIncluded')); } catch (e) { /* ignore */ }
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


function createScrollToTopButton() {
    if (document.getElementById('scrollToTopBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'scrollToTopBtn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Наверх');
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createScrollToTopButton);
} else {
    createScrollToTopButton();
}



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


function createScrollToTopButton() {
    if (document.getElementById('scrollToTopBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'scrollToTopBtn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Наверх');
    document.body.appendChild(btn);

    const style = document.createElement('style');
    style.textContent = `
        #scrollToTopBtn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background-color: #384685;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
        }
        #scrollToTopBtn:hover {
            background-color: #2c3669;
            transform: scale(1.05);
        }
        #scrollToTopBtn.show {
            opacity: 1;
            visibility: visible;
        }
        @media (max-width: 768px) {
            #scrollToTopBtn {
                bottom: 20px;
                right: 20px;
                width: 44px;
                height: 44px;
                font-size: 24px;
            }
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createScrollToTopButton);
} else {
    createScrollToTopButton();
}


function initModalClose() {
    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeModalHandler);
        closeBtn.addEventListener('click', closeModalHandler);
    }

    modal.removeEventListener('click', overlayClickHandler);
    modal.addEventListener('click', overlayClickHandler);
}

function closeModalHandler(e) {
    const modal = document.getElementById('productDetailModal');
    if (modal) modal.classList.remove('active');
}

function overlayClickHandler(e) {
    if (e.target === e.currentTarget) { 
        closeModalHandler();
    }
}

window.showNotification = function(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #384685;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 16px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.style.opacity = '1', 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, duration);
};

function loadI18nAndTranslate() {
  if (typeof window.t === 'undefined') {
    const script = document.createElement('script');
    script.src = '/js/i18n.js';
    script.onload = () => {
      if (typeof initI18n === 'function') initI18n();
    };
    document.head.appendChild(script);
  } else {
    if (typeof initI18n === 'function') initI18n();
  }
}

if (typeof window.initI18n === 'function') {
  initI18n();
} else {
  loadI18nAndTranslate();
}

document.addEventListener('DOMContentLoaded', () => {
    initModalClose();
});

document.addEventListener('DOMContentLoaded', includeComponents);  