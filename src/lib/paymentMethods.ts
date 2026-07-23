import type { PaymentMethodOption } from "@/types/payment"

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card",
    provider: "dodo",
    name: "Card payment",
    description: "Pay securely by card through Dodo Payments hosted checkout.",
  },
  {
    id: "zaad",
    provider: "zaad",
    name: "Zaad",
    description: "Submit a Zaad mobile wallet payment for verification.",
  },
  {
    id: "edahab",
    provider: "edahab",
    name: "eDahab",
    description: "Use your eDahab wallet number for a local payment request.",
  },
  {
    id: "premier_wallet",
    provider: "premier_wallet",
    name: "Premier Wallet",
    description: "Pay from Premier Wallet and track manual verification.",
  },
  {
    id: "wadaag_pay",
    provider: "wadaag_pay",
    name: "Wadaag Pay",
    description: "Submit a Wadaag Pay wallet transaction for confirmation.",
  },
]

export const LOCAL_WALLET_METHODS = PAYMENT_METHODS.filter((method) => method.id !== "card")
