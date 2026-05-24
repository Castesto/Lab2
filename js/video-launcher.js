document.addEventListener('DOMContentLoaded', () => {
    const cardImages = document.querySelectorAll('.card .cardImage img');
    const bottomImg = document.getElementById('bottomVideoImage');

    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
        <div class="video-container">
            <button class="close-video">&times;</button>
            <video controls>
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                Ваш браузер не поддерживает видео.
            </video>
        </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.close-video');
    const video = modal.querySelector('video');

    const closeModal = () => {
        modal.classList.remove('active');
        video.pause();
        video.currentTime = 0;
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    const openModalAndPlay = () => {
        modal.classList.add('active');
        video.play().catch(e => console.log('Автовоспроизведение заблокировано браузером'));
    };

    if (cardImages.length) {
        cardImages.forEach(img => {
            img.classList.add('video-trigger');
            img.addEventListener('click', openModalAndPlay);
        });
    }

    if (bottomImg) {
        bottomImg.classList.add('video-trigger');
        bottomImg.addEventListener('click', openModalAndPlay);
    }
});