import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IBasketView {
	items: HTMLElement[];
	total: number;
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._list = container.querySelector('.basket__list')!;
		this._total = container.querySelector('.basket__price')!;
		this._button = container.querySelector('.basket__button')!;

		this._button.addEventListener('click', () => {
			this.events.emit('order:open');
		});
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
		} else {
			const emptyMessage = document.createElement('p');
			emptyMessage.textContent = 'Корзина пуста';
			this._list.replaceChildren(emptyMessage);
		}
	}

	set total(total: number) {
		this.setText(this._total, `${total} синапсов`);
	}

	set disabled(state: boolean) {
		this.setDisabled(this._button, state);
	}
}