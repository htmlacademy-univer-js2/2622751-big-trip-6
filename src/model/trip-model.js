// src/model/trip-model.js

import { generateMockData } from '../mock/waypoint.js';

export default class TripModel {
  constructor() {
    const { waypoints, destinations, offersByWaypoint } = generateMockData();
    this._waypoints = waypoints;
    this._destinations = destinations;
    this._offersByWaypoint = offersByWaypoint;
    this._activeFilter = 'everything';
    this._activeSort = 'day';
  }

  getWaypoints() {
    let filteredWaypoints = [...this._waypoints];
    
    // Применяем фильтр
    const now = new Date();
    switch (this._activeFilter) {
      case 'future':
        filteredWaypoints = filteredWaypoints.filter(waypoint => new Date(waypoint.dateFrom) > now);
        break;
      case 'past':
        filteredWaypoints = filteredWaypoints.filter(waypoint => new Date(waypoint.dateTo) < now);
        break;
      case 'everything':
      default:
        break;
    }
    
    // Применяем сортировку
    switch (this._activeSort) {
      case 'day':
        filteredWaypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
      case 'price':
        filteredWaypoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
    }
    
    return filteredWaypoints;
  }

  getDestinations() {
    return this._destinations;
  }

  getOffersForWaypoint(waypointId) {
    return this._offersByWaypoint[waypointId] || [];
  }

  getDestinationById(id) {
    return this._destinations.find(dest => dest.id === id);
  }

  getFilters() {
    const now = new Date();
    const hasFuture = this._waypoints.some(waypoint => new Date(waypoint.dateFrom) > now);
    const hasPast = this._waypoints.some(waypoint => new Date(waypoint.dateTo) < now);
    
    return [
      {
        type: 'everything',
        name: 'Everything',
        isActive: this._activeFilter === 'everything',
        isDisabled: false
      },
      {
        type: 'future',
        name: 'Future',
        isActive: this._activeFilter === 'future',
        isDisabled: !hasFuture
      },
      {
        type: 'past',
        name: 'Past',
        isActive: this._activeFilter === 'past',
        isDisabled: !hasPast
      }
    ];
  }

  getSort() {
    return [
      {
        type: 'day',
        name: 'Day',
        isActive: this._activeSort === 'day',
        isDisabled: false
      },
      {
        type: 'event',
        name: 'Event',
        isActive: false,
        isDisabled: true
      },
      {
        type: 'time',
        name: 'Time',
        isActive: false,
        isDisabled: true
      },
      {
        type: 'price',
        name: 'Price',
        isActive: this._activeSort === 'price',
        isDisabled: false
      },
      {
        type: 'offers',
        name: 'Offers',
        isActive: false,
        isDisabled: true
      }
    ];
  }

  setFilter(filterType) {
    this._activeFilter = filterType;
  }

  setSort(sortType) {
    this._activeSort = sortType;
  }
}
