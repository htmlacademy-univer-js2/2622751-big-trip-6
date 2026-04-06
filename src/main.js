import TripPresenter from './presenter/trip-presenter.js';

const tripEventsSection = document.querySelector('.trip-events');

const tripPresenter = new TripPresenter(tripEventsSection);
tripPresenter.init();