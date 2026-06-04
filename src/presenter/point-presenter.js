import PointView from '../view/point-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class PointPresenter {
  constructor(container, onDataChange, onModeChange, onDelete, allOffers) {
    this.container = container;
    this.onDataChange = onDataChange;
    this.onModeChange = onModeChange;
    this.onDelete = onDelete;
    this.allOffers = allOffers || [];
    
    this.pointComponent = null;
    this.editFormComponent = null;
    this.isEditMode = false;
    this.escKeyHandler = null;
    this.waypoint = null;
    this.destination = null;
    this.offers = null;
  }

  init(waypoint, destination, offers) {
    console.log('PointPresenter.init called', { waypoint, destination });
    this.waypoint = waypoint;
    this.destination = destination;
    this.offers = offers;
    
    this.pointComponent = new PointView(
      waypoint, 
      destination, 
      offers,
      () => this.openEditForm()
    );
    
    this.container.appendChild(this.pointComponent.element);
    this.pointComponent.setEditClickHandler();
    this.setFavoriteClickHandler();
  }

  openEditForm() {
    console.log('openEditForm called, isEditMode:', this.isEditMode);
    
    if (this.isEditMode) return;
    
    if (this.onModeChange) {
      this.onModeChange();
    }
    
    console.log('Creating EditFormView...');
    this.editFormComponent = new EditFormView(
      this.waypoint, 
      this.destination, 
      this.allOffers,
      (state) => {
        console.log('Form submitted with state:', state);
        const updatedWaypoint = {
          ...this.waypoint,
          type: state.type,
          destinationId: state.destinationId,
          dateFrom: state.dateFrom,
          dateTo: state.dateTo,
          basePrice: state.basePrice,
          optionsIds: [...state.selectedOfferIds],
          isFavorite: state.isFavorite
        };
        
        this.waypoint = updatedWaypoint;
        
        if (this.onDataChange) {
          this.onDataChange(updatedWaypoint);
        }
        
        this.closeEditForm();
      },
      () => {
        console.log('Form cancelled');
        this.closeEditForm();
      },
      () => {
        console.log('Delete clicked');
        if (this.onDelete) {
          this.onDelete(this.waypoint);
        }
      }
    );
    
    const pointElement = this.pointComponent.element;
    const parent = pointElement.parentElement;
    
    console.log('Replacing point with form...');
    parent.replaceChild(this.editFormComponent.element, pointElement);
    
    this.editFormComponent.setFormSubmitHandler();
    this.editFormComponent.setCancelClickHandler();
    this.editFormComponent.setDeleteClickHandler();
    
    this.escKeyHandler = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        console.log('Escape pressed, closing form');
        this.closeEditForm();
      }
    };
    document.addEventListener('keydown', this.escKeyHandler);
    
    this.isEditMode = true;
    console.log('Form opened, isEditMode:', this.isEditMode);
    
    // Прокручиваем к форме
    setTimeout(() => {
      this.editFormComponent.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  closeEditForm() {
    console.log('closeEditForm called');
    if (!this.isEditMode) return;
    
    const formElement = this.editFormComponent.element;
    const parent = formElement.parentElement;
    
    parent.replaceChild(this.pointComponent.element, formElement);
    
    if (this.escKeyHandler) {
      document.removeEventListener('keydown', this.escKeyHandler);
      this.escKeyHandler = null;
    }
    
    this.isEditMode = false;
    console.log('Form closed');
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
  }
}
