import { Card, ICardActions } from './Card';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

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