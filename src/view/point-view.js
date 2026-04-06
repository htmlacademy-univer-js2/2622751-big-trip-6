import AbstractView from './abstract-view.js';

export default class PointView extends AbstractView {
  getTemplate() {
    return `
      <div class="event">
        <time class="event__date" datetime="2019-03-18">MAR 18</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/taxi.png" alt="Event type icon">
        </div>
        <div class="event__details">
          <div class="event__topic">
            <h3 class="event__title">Taxi to Airport</h3>
          </div>
          <div class="event__schedule">
            <p class="event__time">10:30 — 11:30</p>
          </div>
          <div class="event__price">
            <p class="event__price-value">€ 20</p>
          </div>
        </div>
        <button class="event__favorite-btn event__favorite-btn--active" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.228 4.326 1.572-9.163L1 10.674l9.114-1.324L14 1l3.886 8.35L27 10.674l-6.344 5.489 1.572 9.163L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event details</span>
        </button>
      </div>
    `;
  }
}