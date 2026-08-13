import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = container.querySelector('.modal__close')!;
		this._content = container.querySelector('.modal__content')!;

		this._closeButton.addEventListener('click', () => this.close());
		this.container.addEventListener('click', (e) => {
			if (e.target === this.container) this.close();
		});
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.toggleClass(this.container, 'modal_active', true);
		this.events.emit('modal:open');
	}

	close() {
		this.toggleClass(this.container, 'modal_active', false);
		this._content.replaceChildren();
		this.events.emit('modal:close');
	}
}