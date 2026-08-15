import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

export interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

export class Card<T> extends Component<T> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);

    this._title = container.querySelector('.card__title')!;
    this._price = container.querySelector('.card__price')!;
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  set price(value: number | null) {
    this.setText(
      this._price,
      value !== null ? `${value} синапсов` : 'Бесценно'
    );
  }
}

export class CardCatalog extends Card<IProduct> {
  protected _category: HTMLElement;
  protected _image: HTMLImageElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._category = container.querySelector('.card__category')!;
    this._image = container.querySelector('.card__image')!;

    if (actions?.onClick) {
      container.addEventListener('click', actions.onClick);
    }
  }

  set category(value: string) {
    this.setText(this._category, value);
    const categoryClass =
      (categoryMap as Record<string, string>)[value] ||
      'card__category_other';
    this._category.className = `card__category ${categoryClass}`;
  }

  set image(value: string) {
    this.setImage(this._image, value, this._title.textContent || '');
  }
}

export class CardPreview extends Card<IProduct> {
  protected _category: HTMLElement;
  protected _image: HTMLImageElement;
  protected _text: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._category = container.querySelector('.card__category')!;
    this._image = container.querySelector('.card__image')!;
    this._text = container.querySelector('.card__text')!;
    this._button = container.querySelector('.card__button')!;

    if (actions?.onClick) {
      this._button.addEventListener('click', actions.onClick);
    }
  }

  set category(value: string) {
    this.setText(this._category, value);
    const categoryClass =
      (categoryMap as Record<string, string>)[value] ||
      'card__category_other';
    this._category.className = `card__category ${categoryClass}`;
  }

  set image(value: string) {
    this.setImage(this._image, value, this._title.textContent || '');
  }

  set text(value: string) {
    this.setText(this._text, value);
  }

  set buttonText(value: string) {
    this.setText(this._button, value);
  }

  set buttonDisabled(value: boolean) {
    this.setDisabled(this._button, value);
  }
}

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