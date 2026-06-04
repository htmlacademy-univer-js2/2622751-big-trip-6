import { generateMockData, generateAllOffers } from '../mock/waypoint.js';

export default class TripModel {
  constructor() {
    const { waypoints, destinations, offersByWaypoint } = generateMockData();
    this._waypoints = waypoints;
    this._destinations = destinations;
    this._offersByWaypoint = offersByWaypoint;
    this._allOffers = generateAllOffers();
    this._activeFilter = 'everything';
    this._activeSort = 'day';
    this._observers = [];
  }

  addObserver(observer) {
    this._observers.push(observer);
  }

  _notifyObservers() {
    this._observers.forEach(observer => observer());
  }

  getWaypoints() {
    let filteredWaypoints = [...this._waypoints];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    switch (this._activeFilter) {
      case 'future':
        filteredWaypoints = filteredWaypoints.filter(waypoint => {
          const waypointDate = new Date(waypoint.dateFrom);
          waypointDate.setHours(0, 0, 0, 0);
          return waypointDate >= now;
        });
        break;
      case 'past':
        filteredWaypoints = filteredWaypoints.filter(waypoint => {
          const waypointDate = new Date(waypoint.dateTo);
          waypointDate.setHours(0, 0, 0, 0);
          return waypointDate < now;
        });
        break;
      case 'everything':
      default:
        break;
    }
    
    switch (this._activeSort) {
      case 'day':
        filteredWaypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
        break;
      case 'price':
        filteredWaypoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
      default:
        filteredWaypoints.sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    }
    
    return filteredWaypoints;
  }

  getRawWaypoints() {
    return [...this._waypoints];
  }

  updateWaypoint(updatedWaypoint) {
    const index = this._waypoints.findIndex(waypoint => waypoint.id === updatedWaypoint.id);
    if (index !== -1) {
      this._waypoints[index] = { ...this._waypoints[index], ...updatedWaypoint };
      this._notifyObservers();
      return true;
    }
    return false;
  }

  addWaypoint(waypoint) {
    this._waypoints.push(waypoint);
    this._notifyObservers();
    return true;
  }

  deleteWaypoint(waypointId) {
    const index = this._waypoints.findIndex(waypoint => waypoint.id === waypointId);
    if (index !== -1) {
      this._waypoints.splice(index, 1);
      this._notifyObservers();
      return true;
    }
    return false;
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

  getDestinationByName(name) {
    return this._destinations.find(dest => dest.name === name);
  }

  getAllOffers() {
    return this._allOffers;
  }

  getFilters() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const hasFuture = this._waypoints.some(waypoint => {
      const waypointDate = new Date(waypoint.dateFrom);
      waypointDate.setHours(0, 0, 0, 0);
      return waypointDate >= now;
    });
    
    const hasPast = this._waypoints.some(waypoint => {
      const waypointDate = new Date(waypoint.dateTo);
      waypointDate.setHours(0, 0, 0, 0);
      return waypointDate < now;
    });
    
    return [
      {
        type: 'everything',
        name: 'Everything',
        isActive: this._activeFilter === 'everything',
        isDisabled: false,
        emptyMessage: 'Click New Event to create your first point'
      },
      {
        type: 'future',
        name: 'Future',
        isActive: this._activeFilter === 'future',
        isDisabled: !hasFuture,
        emptyMessage: 'There are no future events now'
      },
      {
        type: 'past',
        name: 'Past',
        isActive: this._activeFilter === 'past',
        isDisabled: !hasPast,
        emptyMessage: 'There are no past events now'
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
    if (this._activeFilter !== filterType) {
      this._activeFilter = filterType;
      this._activeSort = 'day'; // Сбрасываем сортировку при смене фильтра
      this._notifyObservers();
    }
  }

  setSort(sortType) {
    if (this._activeSort !== sortType) {
      this._activeSort = sortType;
      this._notifyObservers();
    }
  }

  getActiveFilter() {
    return this._activeFilter;
  }

  getActiveSort() {
    return this._activeSort;
  }
}
