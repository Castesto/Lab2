const API_KEY = 'live_mEeZaN6nVM7T3UKqKZ1cYYvZ9bJJN0N9nrzNk1xld7daA2nqLDrvSd9w7LJpqfAQ';
const BASE_URL = 'https://api.thecatapi.com/v1';

let allBreeds = [];          
let currentFilteredBreeds = [];

const cardsContainer = document.getElementById('cardsContainer');
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearSearchBtn');
const energySelect = document.getElementById('energyFilter');
const childSelect = document.getElementById('childFilter');
const sheddingSelect = document.getElementById('sheddingFilter');
const randomBreedSelect = document.getElementById('randomBreedSelect');
const randomPhotoBtn = document.getElementById('randomPhotoBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightboxBtn = document.getElementById('closeLightboxBtn');

function showNoResultsMessage(message) {
  cardsContainer.innerHTML = `<div class="no-results"><i class="fas fa-paw"></i> ${message}</div>`;
}

function getImageUrl(breed) {
  if (breed.reference_image_id) {
    return `https://cdn2.thecatapi.com/images/${breed.reference_image_id}.jpg`;
  }
  return 'https://cdn2.thecatapi.com/images/9uh.jpg'; 
}

function renderCards(breedsArray) {
  if (!breedsArray.length) {
    cardsContainer.innerHTML = `<div class="no-results"><i class="fas fa-cat"></i> 🐾 По вашему запросу ничего не найдено. Попробуйте изменить фильтры.</div>`;
    return;
  }

  cardsContainer.innerHTML = breedsArray.map(breed => {
    const imgUrl = getImageUrl(breed);
    const weightMetric = breed.weight?.metric || 'неизвестно';
    const lifeSpan = breed.life_span || '?';
    const temperament = breed.temperament || 'Не указан';
    const origin = breed.origin || 'Разное';
    const description = breed.description || 'Элегантная порода с богатой историей.';
    
    return `
      <article class="breed-card">
        <img class="card-img" src="${imgUrl}" alt="${breed.name}" loading="lazy" data-imgurl="${imgUrl}">
        <div class="card-content">
          <h2 class="breed-name">${breed.name}</h2>
          <div class="breed-origin"><i class="fas fa-globe-americas"></i> ${origin}</div>
          <div class="temperament"><i class="fas fa-heart"></i> ${temperament.substring(0, 80)}${temperament.length > 80 ? '…' : ''}</div>
          <div class="description">${description.substring(0, 110)}${description.length > 110 ? '…' : ''}</div>
          <div class="details-row">
            <span>📏 вес: ${weightMetric} кг</span>
            <span>⏱️ жизнь: ${lifeSpan} лет</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('.card-img').forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      const fullImageUrl = img.getAttribute('data-imgurl') || img.src;
      openLightbox(fullImageUrl);
    });
  });
}

// ---------- Лайтбокс ----------
function openLightbox(imageUrl) {
  lightboxImg.src = imageUrl;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// ---------- Фильтрация и поиск ----------
function filterBreeds() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const energyVal = energySelect.value;
  const childVal = childSelect.value;
  const sheddingVal = sheddingSelect.value;

  let filtered = [...allBreeds];

  if (searchTerm) {
    filtered = filtered.filter(breed => breed.name.toLowerCase().includes(searchTerm));
  }
  if (energyVal !== 'any') {
    filtered = filtered.filter(breed => breed.energy_level === parseInt(energyVal));
  }
  if (childVal !== 'any') {
    filtered = filtered.filter(breed => breed.child_friendly === parseInt(childVal));
  }
  if (sheddingVal !== 'any') {
    filtered = filtered.filter(breed => breed.shedding_level === parseInt(sheddingVal));
  }
  currentFilteredBreeds = filtered;
  renderCards(currentFilteredBreeds);
  updateRandomSelectOptions();
}

function updateRandomSelectOptions() {
  const options = ['<option value="random">🌀 Любая случайная порода</option>'];
  allBreeds.forEach(breed => {
    options.push(`<option value="${breed.id}">🐱 ${breed.name}</option>`);
  });
  randomBreedSelect.innerHTML = options.join('');
}

function showRandomTenBreeds() {
  if (!allBreeds.length) return;
  const shuffled = [...allBreeds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const randomTen = shuffled.slice(0, 10);
  currentFilteredBreeds = randomTen;
  renderCards(randomTen);
}

// ---------- Загрузка всех пород из API ----------
async function fetchAllBreeds() {
  try {
    const response = await fetch(`${BASE_URL}/breeds`, {
      headers: { 'x-api-key': API_KEY }
    });
    if (!response.ok) throw new Error(`Ошибка загрузки пород: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    showNoResultsMessage('Не удалось загрузить породы. Проверьте API ключ или соединение.');
    return [];
  }
}

async function fetchRandomImageByBreed(breedId) {
  try {
    const url = `${BASE_URL}/images/search?breed_ids=${breedId}&limit=1`;
    const res = await fetch(url, { headers: { 'x-api-key': API_KEY } });
    const data = await res.json();
    if (data && data.length) return data[0].url;
    return null;
  } catch(e) {
    console.warn(e);
    return null;
  }
}

async function fetchCompletelyRandomCatImage() {
  try {
    const res = await fetch(`${BASE_URL}/images/search?has_breeds=1&limit=1`, {
      headers: { 'x-api-key': API_KEY }
    });
    const data = await res.json();
    if (data && data.length) return { url: data[0].url, breed: data[0].breeds?.[0] || null };
    return null;
  } catch(e) {
    return null;
  }
}

async function handleRandomPhoto() {
  const selectedBreedId = randomBreedSelect.value;
  let imageUrl = null;
  let breedInfo = null;

  if (selectedBreedId === 'random') {
    const randomRes = await fetchCompletelyRandomCatImage();
    if (randomRes && randomRes.url) {
      imageUrl = randomRes.url;
      breedInfo = randomRes.breed;
    } else {
      imageUrl = 'https://cdn2.thecatapi.com/images/MTU4NTI4Mg.jpg';
    }
  } else {
    const breedObj = allBreeds.find(b => b.id === selectedBreedId);
    if (breedObj) {
      const fetched = await fetchRandomImageByBreed(selectedBreedId);
      imageUrl = fetched || getImageUrl(breedObj);
      breedInfo = breedObj;
    } else {
      imageUrl = 'https://cdn2.thecatapi.com/images/9uh.jpg';
    }
  }
  if (imageUrl) {
    openLightbox(imageUrl);
    if (breedInfo && breedInfo.name) {
      const toast = document.createElement('div');
      toast.innerText = `✨ ${breedInfo.name} — твой случайный кадр ✨`;
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = '#2e241fe6';
      toast.style.color = 'white';
      toast.style.padding = '8px 20px';
      toast.style.borderRadius = '40px';
      toast.style.zIndex = '1100';
      toast.style.fontSize = '0.85rem';
      toast.style.backdropFilter = 'blur(8px)';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  } else {
    openLightbox('https://cdn2.thecatapi.com/images/MTY3ODQ5MQ.jpg');
  }
}

async function initApp() {
  cardsContainer.innerHTML = `<div class="no-results"><i class="fas fa-spinner fa-pulse"></i> Загружаем более 60 пород кошек...</div>`;
  const breeds = await fetchAllBreeds();
  if (!breeds.length) {
    showNoResultsMessage('Не удалось загрузить данные. Проверьте подключение или API-ключ.');
    return;
  }
  allBreeds = breeds;
  currentFilteredBreeds = [...allBreeds];
  updateRandomSelectOptions();
  showRandomTenBreeds();

  searchInput.addEventListener('input', filterBreeds);
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterBreeds();
    searchInput.focus();
  });
  energySelect.addEventListener('change', filterBreeds);
  childSelect.addEventListener('change', filterBreeds);
  sheddingSelect.addEventListener('change', filterBreeds);
  randomPhotoBtn.addEventListener('click', handleRandomPhoto);
  closeLightboxBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
}

initApp().catch(err => {
  console.error(err);
  showNoResultsMessage('Критическая ошибка: ' + err.message);
});