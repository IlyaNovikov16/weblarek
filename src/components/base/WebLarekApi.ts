import { IApi, IProductListResponse, IOrder, IOrderResult } from '../../types';

export class WebLarekApi {
  private api: IApi;
  private cdn: string;

  constructor(cdn: string, api: IApi) {
    this.cdn = cdn;
    this.api = api;
  }

  getProductList(): Promise<IProductListResponse> {
    return this.api.get<IProductListResponse>('/product/').then((data) => ({
      ...data,
      items: data.items.map((item) => ({
        ...item,
        image: this.cdn + item.image,
      })),
    }));
  }

  orderProducts(order: IOrder): Promise<IOrderResult> {
    return this.api.post<IOrderResult>('/order/', order);
  }
}