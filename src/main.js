import TripModel from './model/trip-model.js';
import TripPresenter from './presenter/trip-presenter.js';
import FiltersPresenter from './presenter/filters-presenter.js';

const tripEventsSection = document.querySelector('.trip-events');
const filtersContainer = document.querySelector('.trip-controls__filters');

const tripModel = new TripModel();

// Презентер для фильтров (отдельный!)
const filtersPresenter = new FiltersPresenter(filtersContainer, tripModel);
filtersPresenter.init();

// Презентер для точек маршрута
const tripPresenter = new TripPresenter(tripEventsSection, tripModel);
tripPresenter.init();
