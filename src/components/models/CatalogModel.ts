import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class CatalogModel {
  private items: IProduct[];
  private preview: IProduct | null;

  constructor(protected events: IEvents) {
    this.items = [];
    this.preview = null;
  }

  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit('catalog:changed', this.items);
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getProduct(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setPreview(item: IProduct | null): void {
  this.preview = item;
  if (item) {
    this.events.emit('preview:changed', item);
  }
}

  getPreview(): IProduct | null {
    return this.preview;
  }
}