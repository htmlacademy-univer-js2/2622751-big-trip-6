import FiltersView from '../view/filters-view.js';
import { render } from '../framework/render.js';

export default class FiltersPresenter {
  constructor(container, tripModel) {
    this.container = container;
    this.tripModel = tripModel;
    this.filtersComponent = null;
  }

  init() {
    const filters = this.tripModel.getFilters();
    this.filtersComponent = new FiltersView(filters, (filterType) => {
      this.tripModel.setFilter(filterType);
    });

    render(this.filtersComponent, this.container);
    this.filtersComponent.setFilterChangeHandler();
  }
}
