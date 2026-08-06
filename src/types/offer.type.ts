type PaymentMethods = "pix" | "credit_card";

export interface Offer {
  _id: string,
  link: string,
  default: boolean,
  amount: number,
  amount_original?: number,
  credits: number,
  payment_methods: PaymentMethods[]
};

export type OffersCredits = {
  id: string,
  credits: number,
  price: number,
  popular: boolean
}[];