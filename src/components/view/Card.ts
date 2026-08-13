import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { categoryMap } from '../../utils/constants';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _category: HTMLElement | null;
	protected _image: HTMLImageElement | null;
	protected _button: HTMLButtonElement | null;
	protected _index: HTMLElement | null;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = container.querySelector('.card__title')!;
		this._price = container.querySelector('.card__price')!;
		this._category = container.querySelector('.card__category');
		this._image = container.querySelector<HTMLImageElement>('.card__image');
		this._button = container.querySelector<HTMLButtonElement>('.card__button');
		this._index = container.querySelector('.basket__item-index');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			if (this._button) {
				this.setText(this._button, 'Недоступно');
				this.setDisabled(this._button, true);
			}
		} else {
			this.setText(this._price, `${value} синапсов`);
			if (this._button) {
				this.setDisabled(this._button, false);
			}
		}
	}

	set category(value: string) {
		if (this._category) {
			this.setText(this._category, value);
			const categoryClass = (categoryMap as Record<string, string>)[value] || 'card__category_other';
			this._category.className = `card__category ${categoryClass}`;
		}
	}

	set image(value: string) {
		if (this._image) {
			this.setImage(this._image, value, this._title.textContent || '');
		}
	}

	set index(value: number) {
		if (this._index) this.setText(this._index, String(value));
	}

	set buttonText(value: string) {
		if (this._button && !this._button.disabled) {
			this.setText(this._button, value);
		}
	}
}