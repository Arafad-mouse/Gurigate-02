import { Banknote, CheckCircle2, CreditCard, Landmark, Smartphone, WalletCards } from "lucide-react"

import { cn } from "@/lib/utils"
import type { PaymentMethodId, PaymentMethodOption } from "@/types/payment"

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[]
  selectedMethod: PaymentMethodId
  onSelect: (method: PaymentMethodId) => void
}

function PaymentMethodIcon({ method }: { method: PaymentMethodId }) {
  const iconClassName = "size-5"

  switch (method) {
    case "card":
      return <CreditCard className={iconClassName} />
    case "zaad":
      return <Smartphone className={iconClassName} />
    case "edahab":
      return <WalletCards className={iconClassName} />
    case "premier_wallet":
      return <Landmark className={iconClassName} />
    case "wadaag_pay":
      return <Banknote className={iconClassName} />
  }
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const isSelected = selectedMethod === method.id

        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex min-h-28 w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#E8344E]/30",
              isSelected
                ? "border-[#E8344E] bg-[#E8344E]/5"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
            )}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg border",
                isSelected
                  ? "border-[#E8344E]/20 bg-white text-[#E8344E]"
                  : "border-gray-200 bg-gray-50 text-gray-600",
              )}
            >
              <PaymentMethodIcon method={method.id} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">{method.name}</span>
                {isSelected && <CheckCircle2 className="size-4 shrink-0 text-[#E8344E]" />}
              </span>
              <span className="mt-1 block text-xs leading-5 text-gray-500">{method.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
