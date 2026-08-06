export interface PurchaseOfCredits {
  _id: string,
  offer_id: string,
  created_at: string,
  payment_expires_at: string,
  payment_method: "pix",
  amount: number,
  status: "ACTIVE" | "PAID" | "EXPIRED" | "REFUNDED" | "ERROR",
  credits: number,
};