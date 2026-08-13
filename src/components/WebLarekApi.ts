import { Api } from './base/Api';
import { IOrder, IProduct } from '../types';

export interface IOrderResult {
	id: string;
	total: number;
}

export class WebLarekApi extends Api {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<{ total: number; items: IProduct[] }> {
		return this.get('/product').then((data: any) => ({
			total: data.total,
			items: data.items.map((item: IProduct) => ({
				...item,
				image: this.cdn + item.image,
			})),
		}));
	}

	orderProducts(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order) as Promise<IOrderResult>;
	}
}