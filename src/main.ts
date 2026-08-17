import './scss/styles.scss';

import { WebLarekApi } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { BasketModel } from './components/models/BasketModel';
import { BuyerModel } from './components/models/BuyerModel';
import { CatalogModel } from './components/models/CatalogModel';
import { Header } from './components/view/Header';
import { Catalog } from './components/view/Catalog';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { Modal } from './components/view/Modal';
import { Basket } from './components/view/Basket';
import { OrderForm } from './components/view/OrderForm';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IProduct, IOrder, IOrderForm } from './types';

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const catalogModel = new CatalogModel(events);
const basketModel = new BasketModel(events);
const buyerModel = new BuyerModel(events);

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const catalog = new Catalog(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);

const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
  onClick: () => events.emit('card:toggleBasket'),
});

const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => modal.close(),
});

events.on('items:changed', () => {
  catalog.catalog = catalogModel.getItems().map((item: IProduct) => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item),
    });
    return card.render(item);
  });
});

events.on('card:select', (item: IProduct) => {
  catalogModel.setPreview(item);
});

events.on('preview:changed', (item: IProduct) => {
  const inBasket = basketModel.inBasket(item.id);
  cardPreview.buttonText = inBasket ? 'Удалить из корзины' : 'В корзину';
  cardPreview.buttonDisabled = item.price === null;
  modal.render({ content: cardPreview.render(item) });
  modal.open();
});

events.on('card:toggleBasket', () => {
  const item = catalogModel.getPreview();
  if (!item || item.price === null) return;

  const inBasket = basketModel.inBasket(item.id);
  if (inBasket) {
    basketModel.remove(item.id);
  } else {
    basketModel.add(item);
  }
  modal.close();
});

events.on('basket:change', () => {
  const items = basketModel.getItems();
  header.counter = basketModel.getCount();

  basket.items = items.map((item: IProduct, index: number) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => basketModel.remove(item.id),
    });
    return card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });
  });

  basket.total = basketModel.getTotal();
  basket.disabled = items.length === 0;
});

events.on('basket:open', () => {
  modal.render({ content: basket.render() });
  modal.open();
});

events.on('order:open', () => {
  buyerModel.clearData();
  modal.render({
    content: order.render(),
  });
});

events.on(/^order\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
  buyerModel.setData({ [data.field]: data.value });
});

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
  buyerModel.setData({ [data.field]: data.value });
});

events.on('buyer:change', () => {
  const data = buyerModel.getData();

  order.payment = data.payment;
  order.address = data.address;
  contacts.email = data.email;
  contacts.phone = data.phone;

  const errors = buyerModel.validate();

  order.valid = !errors.payment && !errors.address;
  order.errors = [errors.payment, errors.address].filter(Boolean).join('; ');

  contacts.valid = !errors.email && !errors.phone;
  contacts.errors = [errors.email, errors.phone].filter(Boolean).join('; ');
});

events.on('order:submit', () => {
  modal.render({
    content: contacts.render(),
  });
});

events.on('contacts:submit', () => {
  const buyerData = buyerModel.getData();
  const items = basketModel.getItems().map((item: IProduct) => item.id);
  const total = basketModel.getTotal();

  const orderData: IOrder = {
    ...buyerData,
    items,
    total,
  };

  api
    .orderProducts(orderData)
    .then((result) => {
      basketModel.clear();
      buyerModel.clearData();
      modal.render({ content: success.render({ total: result.total }) });
    })
    .catch(console.error);
});

api
  .getProductList()
  .then((data) => {
    catalogModel.setItems(data.items);
  })
  .catch(console.error);