// src/view/edit-form-view.js

import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const WaypointType = {
  TAXI: 'taxi',
  BUS: 'bus',
  TRAIN: 'train',
  SHIP: 'ship',
  DRIVE: 'drive',
  FLIGHT: 'flight',
  CHECK_IN: 'check-in',
  SIGHTSEEING: 'sightseeing',
  RESTAURANT: 'restaurant'
};

export default class EditFormView extends AbstractStatefulView {
  constructor(waypoint, destination, allOffers, onFormSubmit, onCancelClick) {
    super();
    this._waypoint = waypoint;
    this._destination = destination;
    this._allOffers = allOffers || [];
    this._onFormSubmit = onFormSubmit;
    this._onCancelClick = onCancelClick;
    this._datepickerFrom = null;
    this._datepickerTo = null;
    
    this._setState({
      type: waypoint.type,
      destinationId: waypoint.destinationId,
      dateFrom: waypoint.dateFrom,
      dateTo: waypoint.dateTo,
      basePrice: waypoint.basePrice,
      selectedOfferIds: waypoint.optionsIds || [],
      isFavorite: waypoint.isFavorite
    });
    
    this._handleFormSubmit = this._handleFormSubmit.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleOfferChange = this._handleOfferChange.bind(this);
    this._handlePriceChange = this._handlePriceChange.bind(this);
  }

  get template() {
    const { type, dateFrom, dateTo, basePrice, selectedOfferIds } = this._state;
    const { name: destinationName, description, pictures } = this._destination;
    
    const formattedDateFrom = dayjs(dateFrom).format('DD/MM/YY HH:mm');
    const formattedDateTo = dayjs(dateTo).format('DD/MM/YY HH:mm');
    
    const offersHtml = this._allOffers.map(offer => `
      <div class="event__offer-selector">
        <input 
          class="event__offer-checkbox visually-hidden" 
          id="offer-${offer.id}" 
          type="checkbox" 
          name="offer" 
          value="${offer.id}"
          ${selectedOfferIds.includes(offer.id) ? 'checked' : ''}
        >
        <label class="event__offer-label" for="offer-${offer.id}">
          <span class="event__offer-title">${offer.title}</span>
          +€${offer.price}
        </label>
      </div>
    `).join('');

    const photosHtml = pictures.map(picture => `
      <img class="event__photo" src="${picture.src}" alt="${picture.description}">
    `).join('');

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type" for="event-type-toggle-1">
                <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
              </label>
              <select class="event__type-list" id="event-type-toggle-1" data-type-select>
                ${Object.values(WaypointType).map(typeOption => `
                  <option value="${typeOption}" ${type === typeOption ? 'selected' : ''}>${typeOption}</option>
                `).join('')}
              </select>
            </div>
            <div class="event__field-group">
              <input 
                class="event__input" 
                type="text" 
                name="event-destination" 
                value="${destinationName}" 
                list="destination-list-1"
              >
              <datalist id="destination-list-1">
                <option value="${destinationName}"></option>
              </datalist>
            </div>
            <div class="event__field-group">
              <input 
                class="event__input" 
                type="text" 
                name="event-price" 
                value="${basePrice}"
                data-price-input
              >
            </div>
            <div class="event__field-group">
              <input 
                class="event__input" 
                type="text" 
                name="event-start-time" 
                value="${formattedDateFrom}"
                data-start-date
                readonly
              >
            </div>
            <div class="event__field-group">
              <input 
                class="event__input" 
                type="text" 
                name="event-end-time" 
                value="${formattedDateTo}"
                data-end-date
                readonly
              >
            </div>
            <button class="event__save-btn" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Cancel</button>
          </header>
          <section class="event__details">
            <div class="event__section event__section--offers">
              <h3 class="event__section-title event__section-title--offers">Offers</h3>
              <div class="event__available-offers" data-offers-container>
                ${offersHtml || '<p>No offers available</p>'}
              </div>
            </div>
            <div class="event__section event__section--destination">
              <h3 class="event__section-title event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${description}</p>
              <div class="event__photos-container">
                <div class="event__photos-tape">
                  ${photosHtml}
                </div>
              </div>
            </div>
          </section>
        </form>
      </li>
    `;
  }

  _handleFormSubmit(evt) {
    evt.preventDefault();
    this._onFormSubmit(this._state);
  }

  _handleCancelClick(evt) {
    evt.preventDefault();
    this._onCancelClick();
  }

  _handleTypeChange(evt) {
    this.updateElement({
      type: evt.target.value,
      selectedOfferIds: []
    });
  }

  _handleOfferChange(evt) {
    const offerId = evt.target.value;
    let selectedOfferIds = [...this._state.selectedOfferIds];
    
    if (evt.target.checked) {
      selectedOfferIds.push(offerId);
    } else {
      selectedOfferIds = selectedOfferIds.filter(id => id !== offerId);
    }
    
    this.updateElement({ selectedOfferIds });
  }

  _handlePriceChange(evt) {
    this.updateElement({
      basePrice: parseInt(evt.target.value, 10) || 0
    });
  }

  _initDatepickers() {
    const startDateInput = this.element.querySelector('[data-start-date]');
    const endDateInput = this.element.querySelector('[data-end-date]');
    
    if (startDateInput && !this._datepickerFrom) {
      this._datepickerFrom = flatpickr(startDateInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateFrom,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            this.updateElement({ dateFrom: selectedDates[0].toISOString() });
          }
        }
      });
    }
    
    if (endDateInput && !this._datepickerTo) {
      this._datepickerTo = flatpickr(endDateInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.dateTo,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            this.updateElement({ dateTo: selectedDates[0].toISOString() });
          }
        }
      });
    }
  }

  _destroyDatepickers() {
    if (this._datepickerFrom) {
      this._datepickerFrom.destroy();
      this._datepickerFrom = null;
    }
    if (this._datepickerTo) {
      this._datepickerTo.destroy();
      this._datepickerTo = null;
    }
  }

  _restoreHandlers() {
    const form = this.element.querySelector('form');
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    const typeSelect = this.element.querySelector('.event__type-list');
    const priceInput = this.element.querySelector('[data-price-input]');
    const offersContainer = this.element.querySelector('[data-offers-container]');
    
    if (form) {
      form.addEventListener('submit', this._handleFormSubmit);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this._handleCancelClick);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', this._handleTypeChange);
    }
    if (priceInput) {
      priceInput.addEventListener('change', this._handlePriceChange);
    }
    if (offersContainer) {
      offersContainer.querySelectorAll('.event__offer-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', this._handleOfferChange);
      });
    }
    
    this._initDatepickers();
  }

  setFormSubmitHandler() {
    const form = this.element.querySelector('form');
    if (form) {
      form.addEventListener('submit', this._handleFormSubmit);
    }
  }

  setCancelClickHandler() {
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this._handleCancelClick);
    }
  }

  updateElement(update) {
    super.updateElement(update);
    this._restoreHandlers();
  }

  removeElement() {
    this._destroyDatepickers();
    super.removeElement();
  }
}
