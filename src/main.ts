import './scss/styles.scss';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api';
import { WebLarekApi } from './components/base/WebLarekApi';
import { CatalogModel } from './components/base/models/CatalogModel';
import { BasketModel } from './components/base/models/BasketModel';
import { BuyerModel } from './components/base/models/BuyerModel';


const catalog = new CatalogModel();
catalog.setItems(apiProducts.items);
console.log('1. Каталог товаров (из тестовых данных):', catalog.getItems());
console.log('2. Поиск товара по ID:', catalog.getProduct(apiProducts.items[0].id));
catalog.setPreview(apiProducts.items[0]);
console.log('3. Выбранный для просмотра товар:', catalog.getPreview());

const basket = new BasketModel();
basket.add(apiProducts.items[0]);
basket.add(apiProducts.items[1]);
console.log('4. Товары в корзине:', basket.getItems());
console.log('5. Количество товаров в корзине:', basket.getCount());
console.log('6. Общая сумма:', basket.getTotal());
console.log('7. Товар находится в корзине?:', basket.inBasket(apiProducts.items[0].id));
basket.remove(apiProducts.items[0].id);
console.log('8. Корзина после удаления одного товара:', basket.getItems());
basket.clear();
console.log('9. Корзина после полной очистки:', basket.getItems());

const buyer = new BuyerModel();
console.log('10. Ошибки пустой формы покупателя:', buyer.validate());
buyer.setData({ payment: 'card', address: 'ул. Пушкина, д. 10' });
console.log('11. Данные покупателя (частичное заполнение):', buyer.getData());
console.log('12. Ошибки при частичном заполнении:', buyer.validate());
buyer.setData({ email: 'test@example.com', phone: '+79990001122' });
console.log('13. Ошибки после полного заполнения:', buyer.validate());
buyer.clearData();
console.log('14. Данные покупателя после очистки:', buyer.getData());


const api = new Api(API_URL);
const webLarekApi = new WebLarekApi(CDN_URL, api);

webLarekApi
  .getProductList()
  .then((data) => {
    catalog.setItems(data.items);
    console.log('15. Каталог товаров, загруженный с реального сервера:', catalog.getItems());
  })
  .catch((err) => {
    console.error('Ошибка при получении каталога с сервера:', err);
  });