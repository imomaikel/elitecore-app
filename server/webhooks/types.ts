type TWebhookEvents =
  | 'payment.completed'
  | 'payment.declined'
  | 'payment.refunded'
  | 'payment.dispute.opened'
  | 'payment.dispute.won'
  | 'payment.dispute.lost'
  | 'payment.dispute.closed'
  | 'recurring-payment.started'
  | 'recurring-payment.renewed'
  | 'recurring-payment.ended'
  | 'recurring-payment.status-changed'
  | 'validation.webhook';

type TWebhookPaymentSubject = {
  transaction_id: string;
  status: {
    id: number;
    description: string;
  };
  payment_sequence: string;
  created_at: string;
  price: {
    amount: number;
    currency: string;
  };
  price_paid: {
    amount: number;
    currency: string;
  };
  payment_method: {
    name: string;
    refundable: boolean;
  };
  fees: {
    tax: {
      amount: number;
      currency: string;
    };
    gateway: {
      amount: number;
      currency: string;
    };
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    ip: string;
    username: {
      id: string;
      username: string;
    };
    marketing_consent: boolean;
    country: string;
    postal_code: string | null;
  };
  products: {
    id: number;
    name: string;
    quantity: number;
    base_price: {
      amount: number;
      currency: string;
    };
    paid_price: {
      amount: number;
      currency: string;
    };
    variables:
      | [
          {
            identifier: string;
            option: number;
          },
        ]
      | [];
    expires_at: any;
    custom: any;
    username: {
      id: string;
      username: string;
    };
  }[];
  coupons: any;
  gift_cards: any;
  custom: any;
  recurring_payment_reference: any;
  revenue_share: any;
  decline_reason: {
    code: string;
    message: string;
  } | null;
};

export type TWebhookData = {
  id: string;
  type: TWebhookEvents;
  date: string;
  subject: TWebhookPaymentSubject;
};
