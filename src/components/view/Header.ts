import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IHeader {
  counter: number;
}

export class Header extends Component<IHeader> {
  protected _counter: HTMLElement;
  protected _basket: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._counter = container.querySelector('.header__basket-counter')!;
    this._basket = container.querySelector('.header__basket')!;

    this._basket.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  set counter(value: number) {
    this.setText(this._counter, String(value));
  }
}