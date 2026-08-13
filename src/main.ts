// @ts-ignore
import './scss/styles.scss';
import { WebLarekApi } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { AppData, IOrderForm } from './components/models/AppData';
import { Page } from './components/view/Page';
import { Card } from './components/view/Card';
import { Modal } from './components/view/Modal';
import { Basket } from './components/view/Basket';
import { OrderForm, ContactsForm } from './components/view/Form';
import { Success } from './components/view/Success';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IProduct, IOrder } from './types';


const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const appData = new AppData({}, events);
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);

events.on('items:changed', () => {
	page.catalog = appData.catalog.map((item: IProduct) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render(item);
	});
});

events.on('card:select', (item: IProduct) => {
	appData.setPreview(item);
});

events.on('preview:changed', (item: IProduct) => {
	const inBasket = appData.inBasket(item.id);
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (inBasket) {
				appData.removeFromBasket(item.id);
			} else {
				appData.addToBasket(item);
			}
			modal.close();
		},
	});
	card.buttonText = inBasket ? 'Удалить из корзины' : 'В корзину';
	modal.render({ content: card.render(item) });
	modal.open();
});

events.on('basket:change', () => {
	page.counter = appData.basket.length;
	basket.items = appData.basket.map((item: IProduct, index: number) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => appData.removeFromBasket(item.id),
		});
		card.index = index + 1;
		return card.render(item);
	});
	basket.total = appData.getTotal();
	basket.disabled = appData.basket.length === 0;
});

events.on('basket:open', () => {
	modal.render({ content: basket.render() });
	modal.open();
});

events.on('order:open', () => {
	modal.render({
		content: order.render({
			valid: false,
			errors: '',
		}),
	});
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { payment, address, email, phone } = errors;
	order.valid = !payment && !address;
	order.errors = Object.values({ payment, address }).filter(Boolean).join('; ');

	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ phone, email }).filter(Boolean).join('; ');
});

events.on(/^order\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
	appData.setOrderField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
	appData.setOrderField(data.field, data.value);
});

events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			valid: false,
			errors: '',
		}),
	});
});

events.on('contacts:submit', () => {
	api
		.orderProducts(appData.getOrder() as IOrder)
		.then((result: { id: string; total: number }) => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => modal.close(),
			});
			appData.clearBasket();
			modal.render({ content: success.render({ total: result.total }) });
		})
		.catch(console.error);
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

api
	.getProductList()
	.then((data: { total: number; items: IProduct[] }) => {
		appData.setCatalog(data.items);
	})
	.catch(console.error);