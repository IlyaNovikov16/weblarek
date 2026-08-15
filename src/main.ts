// @ts-ignore
import './scss/styles.scss';
import { WebLarekApi } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { BasketModel } from './components/models/BasketModel';
import { BuyerModel } from './components/models/BuyerModel';
import { CatalogModel } from './components/models/CatalogModel';
import { Header } from './components/view/Header';
import { Catalog } from './components/view/Catalog';
import { Card } from './components/view/Card';
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

const catalogModel = new (CatalogModel as any)(events);
const basketModel = new (BasketModel as any)(events);
const buyerModel = new (BuyerModel as any)(events);

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const catalog = new Catalog(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);

const cardPreview = new (Card as any)(cloneTemplate(cardPreviewTemplate), {
  onClick: () => events.emit('card:toggleBasket'),
});

const success = new Success(cloneTemplate(successTemplate), {
  onClick: () => modal.close(),
});

events.on('items:changed', () => {
  const items = catalogModel.items || catalogModel.catalog || [];
  catalog.catalog = items.map((item: IProduct) => {
    const card = new (Card as any)(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('card:select', item),
    });
    return card.render(item);
  });
});

events.on('card:select', (item: IProduct) => {
  catalogModel.setPreview(item);
});

events.on('preview:changed', (item: IProduct) => {
  const inBasket = basketModel.inBasket ? basketModel.inBasket(item.id) : false;
  (cardPreview as any).buttonText = inBasket ? 'Удалить из корзины' : 'В корзину';
  modal.render({ content: cardPreview.render(item) });
  modal.open();
});

events.on('card:toggleBasket', () => {
  const item = catalogModel.preview;
  if (!item) return;

  const inBasket = basketModel.inBasket ? basketModel.inBasket(item.id) : false;
  if (inBasket) {
    if (basketModel.remove) basketModel.remove(item.id);
    else if (basketModel.removeFromBasket) basketModel.removeFromBasket(item.id);
  } else {
    if (basketModel.add) basketModel.add(item);
    else if (basketModel.addToBasket) basketModel.addToBasket(item);
  }
  modal.close();
});

events.on('basket:change', () => {
  const items = basketModel.items || [];
  header.counter = items.length;
  basket.items = items.map((item: IProduct, index: number) => {
    const card = new (Card as any)(cloneTemplate(cardBasketTemplate), {
      onClick: () => {
        if (basketModel.remove) basketModel.remove(item.id);
        else if (basketModel.removeFromBasket) basketModel.removeFromBasket(item.id);
      },
    });
    (card as any).index = index + 1;
    return card.render(item);
  });
  basket.total = basketModel.getTotal ? basketModel.getTotal() : 0;
  basket.disabled = items.length === 0;
});

events.on('basket:open', () => {
  modal.render({ content: basket.render() });
  modal.open();
});

events.on('order:open', () => {
  modal.render({
    content: order.render(),
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
  if (buyerModel.setData) buyerModel.setData(data.field, data.value);
  else if (buyerModel.setOrderField) buyerModel.setOrderField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof IOrderForm; value: string }) => {
  if (buyerModel.setData) buyerModel.setData(data.field, data.value);
  else if (buyerModel.setOrderField) buyerModel.setOrderField(data.field, data.value);
});

events.on('order:submit', () => {
  modal.render({
    content: contacts.render(),
  });
});

events.on('contacts:submit', () => {
  const buyerData = buyerModel.getData ? buyerModel.getData() : buyerModel.getOrder ? buyerModel.getOrder() : {};
  const items = (basketModel.items || []).map((item: IProduct) => item.id);
  const total = basketModel.getTotal ? basketModel.getTotal() : 0;

  const orderData = {
    ...buyerData,
    items,
    total,
  };

  api
    .orderProducts(orderData as IOrder)
    .then((result: { id: string; total: number }) => {
      if (basketModel.clear) basketModel.clear();
      else if (basketModel.clearBasket) basketModel.clearBasket();
      modal.render({ content: success.render({ total: result.total }) });
    })
    .catch(console.error);
});

api
  .getProductList()
  .then((data: { total: number; items: IProduct[] }) => {
    if (catalogModel.setItems) catalogModel.setItems(data.items);
    else if (catalogModel.setCatalog) catalogModel.setCatalog(data.items);
  })
  .catch(console.error);