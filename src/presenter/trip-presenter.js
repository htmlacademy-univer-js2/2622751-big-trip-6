import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';

export default class TripPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.filtersComponent = null;
    this.sortComponent = null;
    this.pointComponents = new Map(); // храним компоненты точек
    this.currentEditForm = null; // текущая открытая форма редактирования
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderTripEvents();
  }

  renderFilters() {
    this.filtersComponent = new FiltersView();
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      filtersContainer.innerHTML = '';
      render(this.filtersComponent, filtersContainer);
    }
  }

  renderSort() {
    this.sortComponent = new SortView();
    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      render(this.sortComponent, sortContainer, RenderPosition.AFTERBEGIN);
    }
  }

  renderTripEvents() {
    const pointsContainer = document.querySelector('.trip-events');
    if (!pointsContainer) return;

    // Очищаем контейнер, но оставляем сортировку
    const sortElement = this.sortComponent?.element;
    pointsContainer.innerHTML = '';
    if (sortElement) {
      pointsContainer.appendChild(sortElement);
    }

    const waypoints = this.tripModel.getWaypoints();
    
    if (waypoints.length === 0) return;

    // Отрисовываем только точки маршрута (без формы редактирования)
    const waypointsToShow = waypoints.slice(0, 3);
    waypointsToShow.forEach((waypoint) => {
      this.renderPoint(waypoint, pointsContainer);
    });
  }

  renderPoint(waypoint, container) {
    const destination = this.tripModel.getDestinationById(waypoint.destinationId);
    const offers = this.tripModel.getOffersForWaypoint(waypoint.id);
    
    const pointComponent = new PointView(
      waypoint, 
      destination, 
      offers,
      () => this.replacePointToEditForm(waypoint, destination, offers, pointComponent, container)
    );
    
    render(pointComponent, container);
    pointComponent.setEditClickHandler();
    this.pointComponents.set(waypoint.id, pointComponent);
  }

  replacePointToEditForm(waypoint, destination, offers, pointComponent, container) {
    // Если уже открыта какая-то форма, закрываем её
    if (this.currentEditForm) {
      this.closeEditForm();
    }

    const editForm = new EditFormView(
      waypoint,
      destination,
      offers,
      () => this.replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container),
      () => this.replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container)
    );

    replace(editForm, pointComponent);
    this.currentEditForm = editForm;
    
    editForm.setFormSubmitHandler();
    editForm.setCancelClickHandler();
    
    // Добавляем обработчик на Esc
    this._handleEscKeyDown = this._handleEscKeyDown.bind(this, editForm, pointComponent, waypoint, destination, offers, container);
    document.addEventListener('keydown', this._handleEscKeyDown);
  }

  replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container) {
    if (!editForm || !pointComponent) return;
    
    replace(pointComponent, editForm);
    this.currentEditForm = null;
    
    // Удаляем обработчик Esc
    if (this._handleEscKeyDown) {
      document.removeEventListener('keydown', this._handleEscKeyDown);
    }
  }

  closeEditForm() {
    if (this.currentEditForm) {
      this.currentEditForm.element.remove();
      this.currentEditForm = null;
      if (this._handleEscKeyDown) {
        document.removeEventListener('keydown', this._handleEscKeyDown);
      }
    }
  }

  _handleEscKeyDown(editForm, pointComponent, waypoint, destination, offers, container, evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.replaceEditFormToPoint(editForm, pointComponent, waypoint, destination, offers, container);
    }
  }
}