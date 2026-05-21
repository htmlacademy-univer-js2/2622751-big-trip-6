// src/presenter/trip-presenter.js

import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import PointPresenter from './point-presenter.js';
import { render, RenderPosition } from '../framework/render.js';

export default class TripPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.emptyListComponent = null;
    this.pointPresenters = [];
    this.currentSortType = 'day'; // Сортировка по умолчанию
  }

  init() {
    this.renderFilters();
    this.renderTripEvents();
  }

  renderFilters() {
    const filters = this.tripModel.getFilters();
    this.filtersComponent = new FiltersView(filters, (filterType) => {
      this.tripModel.setFilter(filterType);
      this.renderTripEvents();
    });

    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      filtersContainer.innerHTML = '';
      render(this.filtersComponent, filtersContainer);
    }
    this.filtersComponent.setFilterChangeHandler();
  }

  renderSort() {
    this.sortComponent = new SortView(this.currentSortType, (sortType) => {
      if (this.currentSortType === sortType) return; // Не перерисовываем, если сортировка не изменилась
      this.currentSortType = sortType;
      this.tripModel.setSort(sortType);
      this.renderTripEvents();
    });

    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      render(this.sortComponent, sortContainer, RenderPosition.AFTERBEGIN);
      this.sortComponent.setSortChangeHandler();
    }
  }

  renderTripEvents() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    // Уничтожаем старые презентеры
    this.pointPresenters.forEach(presenter => {
      if (presenter.destroy) {
        presenter.destroy();
      }
    });
    this.pointPresenters = [];

    // Очищаем контейнер
    pointsContainer.innerHTML = '';

    // Получаем отсортированные точки
    let waypoints = this.tripModel.getWaypoints();
    
    // Сортируем в зависимости от выбранного типа
    switch (this.currentSortType) {
      case 'day':
        waypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
      case 'price':
        waypoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
      default:
        waypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }

    if (waypoints.length === 0) {
      this.renderEmptyList(pointsContainer);
      return;
    }

    // Отрисовываем сортировку
    this.renderSort();

    // Создаём презентеры для каждой точки
    waypoints.forEach((waypoint) => {
      this.renderPoint(waypoint, pointsContainer);
    });
  }

  renderEmptyList(container) {
    this.emptyListComponent = new EmptyListView();
    render(this.emptyListComponent, container);
  }

  renderPoint(waypoint, container) {
    const destination = this.tripModel.getDestinationById(waypoint.destinationId);
    const offers = this.tripModel.getOffersForWaypoint(waypoint.id);
    
    const pointPresenter = new PointPresenter(
      container,
      this.handleWaypointChange.bind(this),
      () => this.handleModeChange()
    );
    
    pointPresenter.init(waypoint, destination, offers);
    this.pointPresenters.push(pointPresenter);
  }

  handleWaypointChange(updatedWaypoint) {
  // Обновляем данные в модели
  const waypoints = this.tripModel.getWaypoints();
  const index = waypoints.findIndex(waypoint => waypoint.id === updatedWaypoint.id);
  
  if (index !== -1) {
    waypoints[index] = updatedWaypoint;
  }
  
  // Обновляем только конкретный презентер, без перерисовки всего списка
  const pointPresenter = this.pointPresenters[index];
  if (pointPresenter) {
    const destination = this.tripModel.getDestinationById(updatedWaypoint.destinationId);
    const offers = this.tripModel.getOffersForWaypoint(updatedWaypoint.id);
    pointPresenter.update(updatedWaypoint, destination, offers);
  }
}

  handleModeChange() {
    // Закрываем все открытые формы
    this.pointPresenters.forEach(presenter => {
      if (presenter && typeof presenter.resetView === 'function') {
        presenter.resetView();
      }
    });
  }
}
