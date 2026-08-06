import cardValidator from "card-validator";
import { type GetCardToken } from "@/types/global.type";

/// CARD BRANDS
import mastercard from "@/assets/images/bands/mastercard.png";
import visa from "@/assets/images/bands/visa.png";
import hipercard from "@/assets/images/bands/hipercard.png";
import americanExpress from "@/assets/images/bands/american-express.png";
import dinersClub from "@/assets/images/bands/diners-club.png";
import elo from "@/assets/images/bands/elo.png";

export class CreditCardPaymentService {
  private readonly ACCEPTABLE_BANDS = ["mastercard", "visa", "hipercard", "american-express", "diners-club", "elo"];

  async getTokenCard(card: GetCardToken) {
    try {
      const response = await fetch(`https://api.pagar.me/core/v5/tokens?appId=${import.meta.env.VITE_PAGAR_ME_PUBLIC_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "card",
          card: {
            number: card.cardNumber,
            holder_name: card.cardholderName,
            holder_document: card.identificationNumber,
            exp_month: card.cardExpirationMonth,
            exp_year: card.cardExpirationYear,
            cvv: card.securityCode
          }
        })
      });

      if (response.status === 200) {
        const json = await response.json();
        return json.id;
      }
    } catch { }

    return "";
  };

  getCard(cardNumber: string) {
    return cardValidator.number(cardNumber);
  };

  getCreditCardMask(cardNumber: string) {
    const type = this.getCard(cardNumber)?.card?.type;

    switch (type) {
      case "mastercard":
      case "visa":
      case "hipercard":
      case "elo":
        return "#### #### #### ####";
      case "american-express":
        return "#### ###### #####";
      case "diners-club":
        return "#### ###### ####";
      default:
        return "################";
    };
  };

  isCreditCardValid(cardNumber: string) {
    return this.getCard(cardNumber)?.isValid;
  };

  isExpirationDateValid(dateExpiration: string) {
    return cardValidator.expirationDate(dateExpiration)?.isValid;
  };

  isHolderNameValid(name: string) {
    return cardValidator.cardholderName(name)?.isValid;
  };

  getType(cardNumber: string) {
    return this.getCard(cardNumber)?.card?.type || "";
  };

  getBand(cardNumber: string) {
    const type = this.getCard(cardNumber)?.card?.type || "";

    if (this.ACCEPTABLE_BANDS.includes(type)) {
      switch (type) {
        case "mastercard": return mastercard;
        case "visa": return visa;
        case "hipercard": return hipercard;
        case "american-express": return americanExpress;
        case "diners-club": return dinersClub;
        case "elo": return elo;
      }
    }

    return "";
  };
};