import { IApi, IProductListResponse, IOrder, IOrderResult } from '../types';

export class WebLarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProductList(): Promise<IProductListResponse> {
    return this.api.get<IProductListResponse>('/product/');
  }

  orderProducts(order: IOrder): Promise<IOrderResult> {
    return this.api.post<IOrderResult>('/order/', order);
  }
}