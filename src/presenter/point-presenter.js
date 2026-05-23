import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  constructor(container, onDataChange, onModeChange, allOffers) {
    this.container = container;
    this.onDataChange = onDataChange;
    this.onModeChange = onModeChange;
    this.allOffers = allOffers || [];
    
    this.pointComponent = null;
    this.editFormComponent = null;
    this.isEditMode = false;
    this.escKeyHandler = null;
    this.waypoint = null;
    this.destination = null;
    this.offers = null;
    this.currentParent = null;
    this.currentPointElement = null;
  }

  init(waypoint, destination, offers) {
    this.waypoint = waypoint;
    this.destination = destination;
    this.offers = offers;
    
    this.pointComponent = new PointView(
      waypoint, 
      destination, 
      offers,
      () => this.openEditForm()
    );
    
    this.editFormComponent = new EditFormView(
      waypoint, 
      destination, 
      this.allOffers,
      (state) => this.handleFormSubmit(state),
      () => this.closeEditForm()
    );
    
    this.container.appendChild(this.pointComponent.element);
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
  }

  update(waypoint, destination, offers) {
    this.waypoint = waypoint;
    this.destination = destination;
    this.offers = offers;
    
    const newPointComponent = new PointView(
      waypoint, 
      destination, 
      offers,
      () => this.openEditForm()
    );
    
    if (this.pointComponent && this.pointComponent.element && this.pointComponent.element.isConnected) {
      this.pointComponent.element.replaceWith(newPointComponent.element);
    }
    
    this.pointComponent = newPointComponent;
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
    
    this.editFormComponent = new EditFormView(
      waypoint, 
      destination, 
      this.allOffers,
      (state) => this.handleFormSubmit(state),
      () => this.closeEditForm()
    );
    
    if (this.isEditMode) {
      this.closeEditForm();
    }
  }

  openEditForm() {
    if (this.isEditMode) return;
    
    if (this.onModeChange) {
      this.onModeChange();
    }
    
    const pointElement = this.pointComponent.element;
    if (!pointElement || !pointElement.isConnected) return;
    
    const parent = pointElement.parentElement;
    if (!parent) return;
    
    this.currentParent = parent;
    this.currentPointElement = pointElement;
    
    parent.replaceChild(this.editFormComponent.element, pointElement);
    
    this.editFormComponent.setFormSubmitHandler();
    this.editFormComponent.setCancelClickHandler();
    
    this.escKeyHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.closeEditForm();
      }
    };
    document.addEventListener('keydown', this.escKeyHandler);
    
    this.isEditMode = true;
  }

  closeEditForm() {
    if (!this.isEditMode) return;
    
    // Способ 1: используем сохранённые ссылки
    if (this.currentParent && this.currentPointElement) {
      try {
        this.currentParent.replaceChild(this.currentPointElement, this.editFormComponent.element);
      } catch (err) {
        // Игнорируем ошибку, пробуем другие способы
      }
    }
    
    // Способ 2: ищем родителя через DOM
    const formElement = this.editFormComponent.element;
    if (formElement && formElement.isConnected) {
      const parent = formElement.parentElement;
      if (parent) {
        try {
          parent.replaceChild(this.pointComponent.element, formElement);
        } catch (err) {
          // Игнорируем ошибку
        }
      }
    }
    
    // Способ 3: удаляем и добавляем заново
    if (this.editFormComponent.element && this.editFormComponent.element.isConnected) {
      this.editFormComponent.element.remove();
      this.container.appendChild(this.pointComponent.element);
    }
    
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
      this.escKeyHandler = null;
    }
    
    this.isEditMode = false;
    this.currentParent = null;
    this.currentPointElement = null;
  }

  handleFormSubmit(state) {
    const updatedWaypoint = {
      ...this.waypoint,
      type: state.type,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      basePrice: state.basePrice,
      optionsIds: state.selectedOfferIds,
      isFavorite: state.isFavorite
    };
    
    this.waypoint = updatedWaypoint;
    
    if (this.onDataChange) {
      this.onDataChange(updatedWaypoint);
    }
    
    this.closeEditForm();
  }

  setFavoriteClickHandler() {
    this.pointComponent.setFavoriteClickHandler(() => {
      const updatedWaypoint = {
        ...this.waypoint,
        isFavorite: !this.waypoint.isFavorite
      };
      this.waypoint = updatedWaypoint;
      if (this.onDataChange) {
        this.onDataChange(updatedWaypoint);
      }
    });
  }

  resetView() {
    if (this.isEditMode) {
      this.closeEditForm();
    }
  }

  destroy() {
    if (this.pointComponent && this.pointComponent.element) {
      this.pointComponent.element.remove();
    }
    if (this.editFormComponent && this.editFormComponent.element) {
      this.editFormComponent.element.remove();
    }
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
    }
    this.pointComponent = null;
    this.editFormComponent = null;
    this.isEditMode = false;
    this.currentParent = null;
    this.currentPointElement = null;
  }
}
