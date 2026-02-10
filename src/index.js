import countries from './countries.json';
import { renderModal, toggleModal } from './js/modal';

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const API_KEY = 'cMGC6DlkcKqECmYr8IwJ9hM658Z4Qs96';
const pageLimit = 20;

// DOM-елементи
// Основні блоки сторінки
const mainSection = document.querySelector('.main');
const eventsContainer = document.querySelector('.event-container');

// Поле та список вибору країн
const countriesInput = document.querySelector('.input-countries');
const countriesDropdown = document.querySelector('.dropdown-countries');
const countriesBlock = document.querySelector('.countries-block');
const countriesSet = document.querySelector('.countries-set');

// Пагінація
// Кнопки та індикатори пагінації
const paginationPrevBtn = document.querySelector('.pagination-prev');
const paginationNextBtn = document.querySelector('.pagination-next');
const paginationCurrent = document.querySelector('.pagination-current');
const paginationTotal = document.querySelector('.pagination-total');

// Поточний стан пагінації
let currentPage = 0;
let totalPages = 0;
let currentSearchQuery = '';

// API-запити 

// Отримання списку подій
async function getEvents(page = 0, keyword = '') {
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('apikey', API_KEY);
    params.set('page', page);
    params.set('size', pageLimit);

    // Додаємо ключове слово для пошуку
    if (keyword) {
      params.set('keyword', keyword);
    }

    const response = await fetch(`${BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Помилка завантаження:', error);
    return null;
  }
}

// Отримання даних однієї події
async function getEventById(id) {
  try {
    const response = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events/${id}.json?apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Відображення 

// Рендер списку подій
function renderEvents(events) {
  if (!events || events.length === 0) {
    noResultsHandler();
    return;
  }

  const markup = events
    .map(event => {
      const imgUrl = event.images?.[3]?.url || '';
      const venueName =
        event._embedded?.venues?.[0]?.name || 'Місце невідоме';

      return `
        <li class="event-item" data-id="${event.id}">
          <img src="${imgUrl}" class="event-image" alt="${event.name}"/>
          <p class="event-title">${event.name}</p>
          <p class="event-date">${event.dates.start.localDate}</p>
          <p class="event-location">${venueName}</p>
        </li>`;
    })
    .join('');

  eventsContainer.innerHTML = markup;
}

// Повідомлення про відсутність результатів
function noResultsHandler() {
  eventsContainer.innerHTML =
    '<p class="no-results">Нічого не знайдено. Щоб повернутись назад натисніть на кнопку пошуку.</p>';

  paginationCurrent.textContent = '1';
  paginationTotal.textContent = '1';
  paginationPrevBtn.disabled = true;
  paginationNextBtn.disabled = true;
}

// Робота з країнами

// Обробка вибору країни
function handleCountrySelect(e) {
  countriesInput.value = e.target.dataset.name;

  const url = new URL(window.location.href);
  url.searchParams.set('countryCode', e.target.dataset.countrycode);
  window.location.replace(url.toString());

  countriesSet.classList.remove('is-open');
}

// Відкриття та фільтрація списку країн
function toggleCountriesBlock(toggle) {
  if (toggle) {
    countriesSet.classList.toggle('is-open');
  } else {
    countriesSet.classList.add('is-open');
  }

  if (!countriesSet.classList.contains('is-open')) return;

  countriesBlock.innerHTML = '';
  const userInput = countriesInput.value.toLowerCase();

  countries.forEach(country => {
    if (!country.name.toLowerCase().includes(userInput)) return;

    const countryItem = document.createElement('div');
    countryItem.textContent = country.name;
    countryItem.dataset.name = country.name;
    countryItem.dataset.countrycode = country.countryCode;
    countryItem.classList.add('country-item');

    countriesBlock.appendChild(countryItem);
  });

  if (!countriesBlock.hasAttribute('listener')) {
    countriesBlock.setAttribute('listener', '');
    countriesBlock.addEventListener('click', handleCountrySelect);
  }
}

// Пагінація

// Оновлення стану пагінації
function updatePaginationDisplay() {
  paginationCurrent.textContent = currentPage + 1;
  paginationTotal.textContent = totalPages;

  paginationPrevBtn.disabled = currentPage === 0;
  paginationNextBtn.disabled =
    currentPage === totalPages - 1 || totalPages === 0;
}

// Завантаження сторінки подій
async function loadPage(page, keyword = '') {
  try {
    const data = await getEvents(page, keyword);

    if (!data?._embedded?.events) {
      noResultsHandler();
      totalPages = 0;
      currentPage = 0;
      updatePaginationDisplay();
      return;
    }

    renderEvents(data._embedded.events);
    totalPages = Math.ceil(data.page.totalElements / pageLimit);
    currentPage = page;

    updatePaginationDisplay();
  } catch (error) {
    console.error('Помилка завантаження сторінки:', error);
    noResultsHandler();
  }
}

// Обробники подій

// Ввід тексту в поле країни
countriesInput.addEventListener('input', () => toggleCountriesBlock(false));
// Клік по іконці відкриття списку
countriesDropdown.addEventListener('click', () => toggleCountriesBlock(true));

// Зміна країни
countriesInput.addEventListener('change', () => {
  currentSearchQuery = '';
  currentPage = 0;
  loadPage(0);
});

// Клік по картці події
eventsContainer.addEventListener('click', async e => {
  const card = e.target.closest('.event-item');
  if (!card) return;

  const event = await getEventById(card.dataset.id);
  if (event) {
    renderModal(event);
    toggleModal();
  }
});

// Кнопка "назад"
paginationPrevBtn.addEventListener('click', () => {
  if (currentPage > 0) {
    loadPage(currentPage - 1, currentSearchQuery);
  }
});

// Кнопка "вперед"
paginationNextBtn.addEventListener('click', () => {
  if (currentPage < totalPages - 1) {
    loadPage(currentPage + 1, currentSearchQuery);
  }
});

// Старт додатку
async function startApp() {
  try {
    await loadPage(0);
  } catch (error) {
    console.error('Помилка запуску проєкту:', error);
    noResultsHandler();
  }
}

startApp();