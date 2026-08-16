import { Card, ICardActions } from './Card';

export interface ICardBasketData {
  title: string;
  price: number | null;
  index: number;
}

export class CardBasket extends Card<ICardBasketData> {
  protected _index: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._index = container.querySelector('.basket__item-index')!;
    this._button = container.querySelector('.card__button')!;

    if (actions?.onClick) {
      this._button.addEventListener('click', actions.onClick);
    }
  }

  set index(value: number) {
    this.setText(this._index, String(value));
  }
}