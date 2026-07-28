import { IProduct } from '../../types';

export class CatalogModel {
  private items: IProduct[];
  private preview: IProduct | null;

  constructor() {
    this.items = [];
    this.preview = null;
  }

  setItems(items: IProduct[]): void {
    this.items = items;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getProduct(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setPreview(item: IProduct | null): void {
    this.preview = item;
  }

  getPreview(): IProduct | null {
    return this.preview;
  }
}