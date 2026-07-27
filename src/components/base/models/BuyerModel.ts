import { IBuyer, TPayment, TBuyerErrors } from '../../../types';

export class BuyerModel {
  private payment: TPayment;
  private address: string;
  private email: string;
  private phone: string;

  constructor() {
    this.payment = '';
    this.address = '';
    this.email = '';
    this.phone = '';
  }

  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
  }

  getData(): IBuyer {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }

  clearData(): void {
    this.payment = '';
    this.address = '';
    this.email = '';
    this.phone = '';
  }

  validate(): TBuyerErrors {
    const errors: TBuyerErrors = {};

    if (!this.payment) {
      errors.payment = 'Не выбран способ оплаты';
    }
    if (!this.address.trim()) {
      errors.address = 'Укажите адрес доставки';
    }
    if (!this.email.trim()) {
      errors.email = 'Укажите email';
    }
    if (!this.phone.trim()) {
      errors.phone = 'Укажите номер телефона';
    }

    return errors;
  }
}