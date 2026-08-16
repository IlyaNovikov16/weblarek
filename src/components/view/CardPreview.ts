import { Card, ICardActions } from './Card';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

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