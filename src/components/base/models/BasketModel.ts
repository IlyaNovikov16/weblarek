import { IProduct } from '../../../types';

export class BasketModel {
  private items: IProduct[];

  constructor() {
    this.items = [];
  }

  getItems(): IProduct[] {
    return this.items;
  }

  add(item: IProduct): void {
    if (!this.inBasket(item.id)) {
      this.items.push(item);
    }
  }

  remove(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  clear(): void {
    this.items = [];
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.price || 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  inBasket(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}