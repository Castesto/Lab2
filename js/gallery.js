const API_BASE = 'http://localhost:3000'; 

const IMAGES = [
    'images/Барный стул метталик.webp',
    'images/Детская кровть Сказка.jpg',
    'images/Диван прямой Люкс.jpg',
    'images/Кровать 5.png',
    'images/Lucido.png',
    'images/Ронда.png',
    'images/Кухня глетчер.png',
    'images/Кухне денвер.png',
    'images/Кухня лондон.png',
    'images/Кухня амели.png',
    'images/Вешалка напольная италия.webp',
    'images/Шкаф-купе.jpg'
];

let audioContext = null;

function playSoundForImage(index) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    const baseFreq = 400 + (index * 37) % 600;
    osc.frequency.value = baseFreq;
    const waveTypes = ['sine', 'square', 'sawtooth', 'triangle'];
    osc.type = waveTypes[index % waveTypes.length];

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.start();
    osc.stop(now + 0.4);
}

const statusDiv = document.getElementById('soundStatus');

function setPlayingState(isPlaying) {
    if (isPlaying) {
        statusDiv.innerHTML = '🔊 Играет...';
        statusDiv.classList.add('playing');
        statusDiv.classList.remove('paused');
    } else {
        statusDiv.innerHTML = '⚫ Пауза';
        statusDiv.classList.add('paused');
        statusDiv.classList.remove('playing');
    }
}

const imgElement = document.getElementById('galleryImage');

function changeImageWithTransition(newSrc) {
    imgElement.style.opacity = '0';
    setTimeout(() => {
        imgElement.src = newSrc;
        imgElement.style.opacity = '1';
    }, 200);
}

let currentImageIndex = -1;

function randomImageAndSound() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * IMAGES.length);
    } while (newIndex === currentImageIndex && IMAGES.length > 1);
    currentImageIndex = newIndex;

    const newImageSrc = IMAGES[currentImageIndex];
    changeImageWithTransition(newImageSrc);

    setPlayingState(true);
    playSoundForImage(currentImageIndex);

    setTimeout(() => {
        setPlayingState(false);
    }, 500);
}

document.getElementById('randomBtn1').addEventListener('click', randomImageAndSound);
document.getElementById('randomBtn2').addEventListener('click', randomImageAndSound);

if (imgElement && IMAGES.length) {
    imgElement.src = IMAGES[0];
    currentImageIndex = 0;
    setPlayingState(false);
}