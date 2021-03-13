import { fetchEarthquakes } from './lib/earthquakes';
import { el, element, formatDate } from './lib/utils';
import { init, createPopup, clearMarkers } from './lib/map';

let map;

function addLoadingToDOM() {
  const loading = document.querySelector('.loading');
  if (loading.classList.contains('hidden')) {
    loading.classList.toggle('hidden');
  }
}

function removeLoadingFromDOM() {
  const loading = document.querySelector('.loading');
  loading.classList.add('hidden');
}

function addLoadingErrorToDOM() {
  const loading = document.querySelector('.loading');
  const parent = loading.parentNode;

  parent.appendChild(
    element('p', { class: 'error' }, null, 'Villa við að sækja gögn'),
  );
}

function clearDOM() {
  clearMarkers();
  const h1 = document.querySelector('h1');
  while (h1.firstChild) {
    h1.removeChild(h1.firstChild);
  }
  const cache = document.querySelector('.cache');
  while (cache.firstChild) {
    cache.removeChild(cache.firstChild);
  }
  const earthquakes = document.querySelector('.earthquakes');
  while (earthquakes.firstChild) {
    earthquakes.removeChild(earthquakes.firstChild);
  }
  const error = document.querySelector('.error');
  if (error) {
    error.parentNode.removeChild(error);
  }
}

function addEarthquakesToDOM(earthquakes, pageTitle) {
  const h1 = document.querySelector('h1');
  const cache = document.querySelector('.cache');

  h1.append(pageTitle);
  cache.append(`Gögn eru ${earthquakes.info.cached ? '' : 'ekki'} í cache. Fyrirspurn tók ${earthquakes.info.time} sek.`);

  const ul = document.querySelector('.earthquakes');

  earthquakes.data.features.forEach((quake) => {
    const {
      title, mag, time, url,
    } = quake.properties;

    const link = element('a', { href: url, target: '_blank' }, null, 'Skoða nánar');

    const markerContent = el('div',
      el('h3', title),
      el('p', formatDate(time)),
      el('p', link));
    const marker = createPopup(quake.geometry, markerContent.outerHTML);

    const onClick = () => {
      marker.openPopup();
    };

    const li = el('li');

    li.appendChild(
      el('div',
        el('h2', title),
        el('dl',
          el('dt', 'Tími'),
          el('dd', formatDate(time)),
          el('dt', 'Styrkur'),
          el('dd', `${mag} á richter`),
          el('dt', 'Nánar'),
          el('dd', url.toString())),
        element('div', { class: 'buttons' }, null,
          element('button', null, { click: onClick }, 'Sjá á korti'),
          link)),
    );

    ul.appendChild(li);
  });
}

async function overrideLinks() {
  const nav = document.querySelector('.nav');
  const lists = nav.querySelectorAll('.list');

  lists.forEach((list) => {
    const h2 = list.querySelector('h2');
    const links = list.querySelectorAll('a');

    links.forEach((link) => {
      link.addEventListener('click', async (event) => {
        event.preventDefault();
        clearDOM();
        addLoadingToDOM();
        const url = new URL(event.target.href);
        const urlParams = url.searchParams;
        const period = urlParams.has('period') ? urlParams.get('period') : 'hour';
        const type = urlParams.has('type') ? urlParams.get('type') : 'all';

        const earthquakes = await fetchEarthquakes(period, type);
        removeLoadingFromDOM();
        if (!earthquakes) {
          addLoadingErrorToDOM();
          return;
        }
        addEarthquakesToDOM(earthquakes, `${event.target.innerText}, ${h2.textContent.toLowerCase()}`);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {

  map = document.querySelector('.map');

  init(map);

  addLoadingToDOM();

  await overrideLinks();

  const earthquakes = await fetchEarthquakes('hour', 'all');

  removeLoadingFromDOM();

  if (!earthquakes) {
    addLoadingErrorToDOM();
    return;
  }
  addEarthquakesToDOM(earthquakes, 'Allir jarðskjálftar, seinustu klukkustund');
});