export interface Subscription {
  _id: string,
  created_at: string,
  paid_at: string,
  expires_at: string,
  payment_expires_at: string,
  payment_method: "pix" | "credit_card",
  amount: number,
  status: "ACTIVE" | "PAID" | "EXPIRED" | "REFUNDED" | "ERROR",
  period: "MONTHLY",
  cycle: number,
  credits: number
};