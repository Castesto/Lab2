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


window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(function() {
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

window.closeModal = function(modalElement) {
    if (modalElement) modalElement.classList.remove('active');
};

document.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal-overlay');
    if (modal && (e.target === modal || e.target.classList.contains('modal-close'))) {
        closeModal(modal);
    }
});

document.addEventListener('DOMContentLoaded', includeComponents);  