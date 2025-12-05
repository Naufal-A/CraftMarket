declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface Transaction {
    token: string;
    redirect_url: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    billing_address?: Record<string, unknown>;
    shipping_address?: Record<string, unknown>;
  }

  interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  interface PayloadMidtrans {
    transaction_details: TransactionDetails;
    customer_details?: CustomerDetails;
    item_details?: ItemDetail[];
    enabled_payments?: string[];
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(payload: PayloadMidtrans): Promise<Transaction>;
  }
}
