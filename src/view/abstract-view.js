export default class AbstractView {
  constructor() {
    if (new.target === AbstractView) {
      throw new Error('Can\'t instantiate AbstractView, only concrete one.');
    }
    this.element = null;
  }

  getTemplate() {
    throw new Error('Abstract method not implemented');
  }

  getElement() {
    if (!this.element) {
      this.element = this.createElement(this.getTemplate());
    }
    return this.element;
  }

  createElement(template) {
    const newElement = document.createElement('div');
    newElement.innerHTML = template;
    return newElement.firstElementChild;
  }

  removeElement() {
    this.element = null;
  }
}