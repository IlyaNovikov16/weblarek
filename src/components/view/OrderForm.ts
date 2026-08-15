import { Form } from './Form';
import { IEvents } from '../base/Events';

export class OrderForm extends Form<{ payment: string; address: string }> {
  protected _buttons: HTMLButtonElement[];

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._buttons = Array.from(container.querySelectorAll('.button_alt'));

    this._buttons.forEach((button) => {
      button.addEventListener('click', () => {
        this.onInputChange('payment', button.name);
      });
    });
  }

  set payment(name: string) {
    this._buttons.forEach((button) => {
      this.toggleClass(button, 'button_alt-active', button.name === name);
    });
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }
}