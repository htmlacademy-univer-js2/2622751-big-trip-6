// src/presenter/trip-presenter.js

import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EmptyListView from '../view/empty-list-view.js';
import PointView from '../view/point-view.js';
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
    this.currentSortType = 'day';
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
      if (this.currentSortType === sortType) return;
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

    this.pointPresenters.forEach(presenter => {
      if (presenter.destroy) presenter.destroy();
    });
    this.pointPresenters = [];

    pointsContainer.innerHTML = '';

    const waypoints = this.tripModel.getWaypoints();

    if (waypoints.length === 0) {
      this.renderEmptyList(pointsContainer);
      return;
    }

    this.renderSort();

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
    const allOffers = this.tripModel.getAllOffers();
    
    const pointPresenter = new PointPresenter(
      container,
      this.handleWaypointChange.bind(this),
      () => this.handleModeChange(),
      allOffers
    );
    
    pointPresenter.init(waypoint, destination, offers);
    this.pointPresenters.push(pointPresenter);
  }

  handleWaypointChange(updatedWaypoint) {
    const waypoints = this.tripModel.getWaypoints();
    const index = waypoints.findIndex(waypoint => waypoint.id === updatedWaypoint.id);
    
    if (index !== -1) {
      waypoints[index] = updatedWaypoint;
    }
    
    const pointPresenter = this.pointPresenters[index];
    if (pointPresenter) {
      pointPresenter.waypoint = updatedWaypoint;
      pointPresenter.destination = this.tripModel.getDestinationById(updatedWaypoint.destinationId);
      pointPresenter.offers = this.tripModel.getOffersForWaypoint(updatedWaypoint.id);
      
      if (!pointPresenter.isEditMode) {
        const newPointComponent = new PointView(
          updatedWaypoint,
          pointPresenter.destination,
          pointPresenter.offers,
          () => pointPresenter.openEditForm()
        );
        if (pointPresenter.pointComponent && pointPresenter.pointComponent.element) {
          pointPresenter.pointComponent.element.replaceWith(newPointComponent.element);
        }
        pointPresenter.pointComponent = newPointComponent;
        pointPresenter.pointComponent.setEditClickHandler();
        pointPresenter.setFavoriteClickHandler();
      } else {
        pointPresenter.editFormComponent.updateElement({
          type: updatedWaypoint.type,
          destinationId: updatedWaypoint.destinationId,
          dateFrom: updatedWaypoint.dateFrom,
          dateTo: updatedWaypoint.dateTo,
          basePrice: updatedWaypoint.basePrice,
          selectedOfferIds: updatedWaypoint.optionsIds,
          isFavorite: updatedWaypoint.isFavorite
        });
      }
    }
  }

  handleModeChange() {
    this.pointPresenters.forEach(presenter => {
      if (presenter && typeof presenter.resetView === 'function') {
        presenter.resetView();
      }
    });
  }
}
