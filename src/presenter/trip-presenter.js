import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';

export default class TripPresenter {
  constructor(container) {
    this.container = container;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.pointComponents = [];
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderPoints();
  }

  renderFilters() {
    this.filtersComponent = new FiltersView();
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      filtersContainer.innerHTML = '';
      filtersContainer.appendChild(this.filtersComponent.getElement());
    }
  }

  renderSort() {
    this.sortComponent = new SortView();
    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      sortContainer.insertBefore(this.sortComponent.getElement(), sortContainer.firstChild);
    }
  }

  renderPoints() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    // Отрисовываем 3 точки маршрута
    for (let i = 0; i < 3; i++) {
      const pointComponent = new PointView();
      this.pointComponents.push(pointComponent);
      pointsContainer.appendChild(pointComponent.getElement());
    }
  }
}