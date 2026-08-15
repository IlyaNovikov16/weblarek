# Проектная работа «Веб-ларёк»

Интернет-магазин товаров для веб-разработчиков. В приложении реализован каталог товаров, просмотр подробной информации о товаре в модальном окне, добавление товаров в корзину и двухшаговое оформление заказа.

**Стек:** HTML, SCSS, TypeScript, Vite.

---

## Структура проекта

* `src/` — исходные файлы проекта
* `src/components/` — папка с JS/TS компонентами
* `src/components/base/` — папка с базовым кодом (`Api`, `Component`, `EventEmitter`)
* `src/components/models/` — папка с классами моделей данных (`CatalogModel`, `BasketModel`, `BuyerModel`)
* `src/components/view/` — папка с компонентами отображения (`Header`, `Catalog`, `Card`, `Modal`, `Basket`, `OrderForm`, `ContactsForm`, `Success`)

**Важные файлы:**
* `index.html` — HTML-файл главной страницы
* `src/types/index.ts` — файл с типами и интерфейсами
* `src/main.ts` — точка входа приложения (Презентер)
* `src/scss/styles.scss` — корневой файл стилей
* `src/utils/constants.ts` — файл с константами
* `src/utils/utils.ts` — файл с утилитами

---

## Установка и запуск

Для установки и запуска проекта выполните команды:

```bash
npm install
npm run dev
```

Для сборки проекта в продакшен:

```bash
npm run build
```

---

## Архитектура приложения (Паттерн MVP)

Код приложения разделен на слои согласно парадигме **MVP (Model-View-Presenter)**:

1. **Model (Модель)** — слой данных, отвечает за хранение, изменение и валидацию бизнес-данных приложения (`CatalogModel`, `BasketModel`, `BuyerModel`). Модели абсолютно самостоятельны и изолированы от отображения.
2. **View (Представление)** — слой отображения, отвечает за рендеринг элементов интерфейса в DOM и обработку пользовательских событий (клики, ввод данных). Все компоненты View наследуются от базового класса `Component`.
3. **Presenter (Презентер / `main.ts`)** — связующее звено, реализует логику приложения. Связывает слой View и слой Model через события брокера `EventEmitter`.

---

## Базовый код

### Класс `Component<T>`
Абстрактный базовый класс для всех компонентов интерфейса (слой View). Инкапсулирует базовую работу с DOM-элементами.

* **Конструктор**:
  * `constructor(container: HTMLElement)` — принимает ссылку на родительский DOM-элемент.
* **Методы**:
  * `render(data?: Partial<T>): HTMLElement` — обновляет свойства компонента и возвращает корневой элемент.
  * `setImage(element: HTMLImageElement, src: string, alt?: string): void` — безопасная установка изображения.
  * `setText(element: HTMLElement, value: unknown): void` — установка текстового содержимого.
  * `setDisabled(element: HTMLElement, state: boolean): void` — управление атрибутом `disabled`.
  * `toggleClass(element: HTMLElement, className: string, force?: boolean): void` — переключение CSS-класса.

### Класс `Api`
Базовый класс для выполнения HTTP-запросов.

* **Конструктор**:
  * `constructor(baseUrl: string, options: RequestInit = {})` — принимает базовый URL и заголовки по умолчанию.
* **Методы**:
  * `get<T extends object>(uri: string): Promise<T>` — выполняет GET-запрос.
  * `post<T extends object>(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<T>` — отправляет данные на сервер.

### Класс `EventEmitter`
Брокер событий, реализующий паттерн «Наблюдатель» (Observer).

* **Методы**:
  * `on<T extends object>(event: EventName, callback: (data: T) => void): void` — подписка на событие.
  * `off(event: EventName, callback: Subscriber): void` — отписка от события.
  * `emit<T extends object>(event: string, data?: T): void` — генерация события.

---

## Данные и типы данных (`src/types/index.ts`)

* **`ApiPostMethods`** — допустимые HTTP-методы отправки (`'POST' | 'PUT' | 'DELETE'`).
* **`TPayment`** — варианты способов оплаты (`'card' | 'cash' | ''`).
* **`IProduct`** — структура карточки товара:
  * `id: string` — уникальный идентификатор.
  * `title: string` — название товара.
  * `description: string` — описание товара.
  * `category: string` — категория товара.
  * `image: string` — ссылка на изображение.
  * `price: number | null` — цена товара (`null`, если товар недоступен к покупке).
* **`IBuyer`** — данные покупателя:
  * `payment: TPayment` — способ оплаты.
  * `address: string` — адрес доставки.
  * `email: string` — электронная почта.
  * `phone: string` — телефон.
* **`IOrderForm`** — тип данных формы покупателя (`IBuyer`).
* **`TBuyerErrors`** — объект с ошибками валидации полей формы (`Partial<Record<keyof IBuyer, string>>`).
* **`IOrder`** — объект заказа для отправки на сервер (`IBuyer`, `items: string[]`, `total: number`).
* **`IOrderResult`** — ответ сервера после успешной покупки (`id: string`, `total: number`).
* **`IProductListResponse`** — ответ сервера со списком товаров (`total: number`, `items: IProduct[]`).

---

## Слои моделей данных (Model)

### Класс `CatalogModel`
Хранит массив всех товаров магазина и товар, выбранный для детального просмотра.

* **Поля**:
  * `items: IProduct[]` — массив товаров каталога.
  * `preview: IProduct | null` — товар для предпросмотра.
* **Методы**:
  * `setItems(items: IProduct[]): void` — сохраняет полученный каталог товаров.
  * `getItems(): IProduct[]` — возвращает каталог товаров.
  * `getProduct(id: string): IProduct | undefined` — возвращает товар по его ID.
  * `setPreview(item: IProduct): void` — устанавливает товар для модального окна предпросмотра.
  * `getPreview(): IProduct | null` — возвращает текущий товар для предпросмотра.

### Класс `BasketModel`
Управляет содержимым корзины покупателя.

* **Поля**:
  * `items: IProduct[]` — список товаров в корзине.
* **Методы**:
  * `getItems(): IProduct[]` — возвращает список товаров в корзине.
  * `add(item: IProduct): void` — добавляет товар в корзину.
  * `remove(id: string): void` — удаляет товар из корзины по ID.
  * `clear(): void` — полностью очищает корзину.
  * `getTotal(): number` — рассчитывает общую стоимость товаров в корзине.
  * `getCount(): number` — возвращает количество товаров в корзине.
  * `inBasket(id: string): boolean` — проверяет наличие товара в корзине.

### Класс `BuyerModel`
Хранит и валидирует данные покупателя для оформления заказа.

* **Поля**:
  * `payment: TPayment` — выбранный способ оплаты.
  * `address: string` — адрес доставки.
  * `phone: string` — контактный телефон.
  * `email: string` — электронная почта.
* **Методы**:
  * `setData(field: keyof IBuyer, value: string): void` — обновляет переданное поле покупателя и запускает валидацию.
  * `getData(): IBuyer` — возвращает полные данные покупателя.
  * `clearData(): void` — сбрасывает данные покупателя.
  * `validate(): TBuyerErrors` — проверяет корректность полей и возвращает объект с ошибками.

---

## Слой отображения (View)

### Класс `Header`
Управляет отображением шапки сайта.

* **Конструктор**:
  * `constructor(container: HTMLElement, events: IEvents)` — принимает контейнер шапки и брокер событий.
* **Поля**:
  * `_counter: HTMLElement` — счетчик количества товаров в корзине.
  * `_basketButton: HTMLButtonElement` — кнопка открытия корзины.
* **Методы / Сеттеры**:
  * `set counter(value: number)` — обновляет числовое значение на иконке корзины.

### Класс `Catalog`
Отображает контейнер галереи товаров на главной странице.

* **Конструктор**:
  * `constructor(container: HTMLElement)` — принимает элемент-контейнер каталога.
* **Поля**:
  * `container: HTMLElement` — DOM-элемент сетки каталога.
* **Методы / Сеттеры**:
  * `set catalog(items: HTMLElement[])` — заполняет каталог массивом готовых DOM-элементов карточек.

### Класс `Card`
Универсальный компонент для отображения карточки товара (в каталоге, модальном окне или корзине).

* **Конструктор**:
  * `constructor(container: HTMLElement, actions?: ICardActions)` — принимает элемент карточки и обработчики кликов.
* **Поля**:
  * `_title: HTMLElement` — название товара.
  * `_image?: HTMLImageElement` — изображение товара.
  * `_category?: HTMLElement` — категория товара.
  * `_price: HTMLElement` — цена товара.
  * `_text?: HTMLElement` — подробное описание товара.
  * `_button?: HTMLButtonElement` — кнопка добавления/удаления товара.
  * `_index?: HTMLElement` — порядковый номер товара в корзине.
* **Методы / Сеттеры**:
  * `set title(value: string)` — устанавливает заголовок.
  * `set image(value: string)` — устанавливает ссылку на картинку.
  * `set category(value: string)` — устанавливает текст категории и соответствующий CSS-класс.
  * `set price(value: number | null)` — выводит цену товара и деактивирует кнопку покупки, если `price === null`.
  * `set text(value: string)` — устанавливает описание товара.
  * `set buttonText(value: string)` — изменяет текст на кнопке действия.
  * `set index(value: number)` — устанавливает порядковый номер элемента в корзине.

### Класс `Modal`
Универсальное модальное окно.

* **Конструктор**:
  * `constructor(container: HTMLElement, events: IEvents)` — принимает контейнер модального окна и брокер событий.
* **Поля**:
  * `_closeButton: HTMLButtonElement` — кнопка закрытия окна (крестик).
  * `_content: HTMLElement` — внутренний контейнер для динамического содержимого.
* **Методы / Сеттеры**:
  * `set content(value: HTMLElement)` — обновляет содержимого модального окна.
  * `open(): void` — открывает модальное окно и блокирует прокрутку страницы.
  * `close(): void` — закрывает модальное окно и возобновляет прокрутку.
  * `render(data: IModalData): HTMLElement` — монтирует контент и отображает модальное окно.

### Класс `Basket`
Отображение содержимого корзины покупателя.

* **Конструктор**:
  * `constructor(container: HTMLElement, events: IEvents)` — принимает элемент корзины и брокер событий.
* **Поля**:
  * `_list: HTMLElement` — список товаров в корзине.
  * `_total: HTMLElement` — элемент отображения итоговой суммы.
  * `_button: HTMLButtonElement` — кнопка перехода к оформлению заказа.
* **Методы / Сеттеры**:
  * `set items(items: HTMLElement[])` — заменяет список товаров в корзине.
  * `set total(value: number)` — выводит суммарную стоимость.
  * `set disabled(state: boolean)` — управляет активностью кнопки «Оформить».

### Класс `OrderForm`
Форма первого шага оформления заказа (выбор способа оплаты и адрес).

* **Конструктор**:
  * `constructor(container: HTMLFormElement, events: IEvents)` — принимает HTML-элемент формы и брокер событий.
* **Поля**:
  * `_buttons: HTMLButtonElement[]` — кнопки выбора способа оплаты (`Онлайн` / `При получении`).
  * `_addressInput: HTMLInputElement` — поле ввода адреса доставки.
  * `_errors: HTMLElement` — элемент для вывода ошибок валидации.
  * `_submitButton: HTMLButtonElement` — кнопка перехода ко второму шагу.
* **Методы / Сеттеры**:
  * `set valid(state: boolean)` — переключает доступность кнопки отправки формы.
  * `set errors(value: string)` — выводит текст ошибок валидации.
  * `selectPayment(name: string): void` — переключает активное состояние кнопок способа оплаты.

### Класс `ContactsForm`
Форма второго шага оформления заказа (контактные данные).

* **Конструктор**:
  * `constructor(container: HTMLFormElement, events: IEvents)` — принимает HTML-элемент формы и брокер событий.
* **Поля**:
  * `_emailInput: HTMLInputElement` — поле ввода электронной почты.
  * `_phoneInput: HTMLInputElement` — поле ввода номера телефона.
  * `_errors: HTMLElement` — элемент для вывода ошибок валидации.
  * `_submitButton: HTMLButtonElement` — кнопка завершения и оплаты заказа.
* **Методы / Сеттеры**:
  * `set valid(state: boolean)` — переключает доступность кнопки отправки.
  * `set errors(value: string)` — выводит текст ошибок валидации.

### Класс `Success`
Окно успешного оформления заказа.

* **Конструктор**:
  * `constructor(container: HTMLElement, actions?: ISuccessActions)` — принимает элемент шаблона и объект с обработчиком закрытия.
* **Поля**:
  * `_close: HTMLButtonElement` — кнопка завершения работы с окном («За покупками»).
  * `_total: HTMLElement` — элемент вывода списанной суммы.
* **Методы / Сеттеры**:
  * `set total(value: number)` — выводит итоговую сумму списанных средств.

---

## Слой коммуникации

### Класс `WebLarekApi`
Класс-адаптер для взаимодействия с REST API сервера.

* **Конструктор**:
  * `constructor(cdn: string, baseUrl: string, options?: RequestInit)` — принимает URL к хосту изображений, базовый адрес API и параметры.
* **Поля**:
  * `cdn: string` — базовый путь к CDN с изображениями.
* **Методы**:
  * `getProductList(): Promise<IProductListResponse>` — получает список всех товаров с сервера.
  * `orderProducts(order: IOrder): Promise<IOrderResult>` — отправляет сформированный заказ на сервер.