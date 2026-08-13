import { IProduct, IOrder } from '../../types';
import { IEvents } from '../base/Events';

export interface IOrderForm {
	payment: string;
	address: string;
	email: string;
	phone: string;
}

export class AppData {
	catalog: IProduct[] = [];
	basket: IProduct[] = [];
	order: IOrderForm = {
		payment: 'card',
		address: '',
		email: '',
		phone: '',
	};
	preview: string | null = null;
	formErrors: Partial<IOrderForm> = {};

	constructor(_data: Record<string, unknown>, protected events: IEvents) {}

	setCatalog(items: IProduct[]) {
		this.catalog = items;
		this.events.emit('items:changed');
	}

	setPreview(item: IProduct) {
		this.preview = item.id;
		this.events.emit('preview:changed', item);
	}

	addToBasket(item: IProduct) {
		if (!this.inBasket(item.id)) {
			this.basket.push(item);
			this.events.emit('basket:change');
		}
	}

	removeFromBasket(id: string) {
		this.basket = this.basket.filter((item) => item.id !== id);
		this.events.emit('basket:change');
	}

	clearBasket() {
		this.basket = [];
		this.events.emit('basket:change');
	}

	inBasket(id: string): boolean {
		return this.basket.some((item) => item.id === id);
	}

	getTotal(): number {
		return this.basket.reduce((total, item) => total + (item.price || 0), 0);
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;
		this.validateOrder();
	}

	validateOrder() {
		const errors: Partial<IOrderForm> = {};
		if (!this.order.payment) errors.payment = 'Укажите способ оплаты';
		if (!this.order.address) errors.address = 'Укажите адрес доставки';
		if (!this.order.email) errors.email = 'Укажите email';
		if (!this.order.phone) errors.phone = 'Укажите телефон';

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	getOrder(): IOrder {
		return {
			...this.order,
			total: this.getTotal(),
			items: this.basket.map((item) => item.id),
		} as IOrder;
	}}