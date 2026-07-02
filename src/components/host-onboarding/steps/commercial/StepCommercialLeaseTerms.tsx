import type { HostFormData } from "../../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

function CurrencyField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded-xl border border-border pl-8 pr-4 py-3 bg-background"
        />
      </div>
    </label>
  );
}

export function StepCommercialLeaseTerms({ data, onChange }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground mb-2">Lease terms</h1>
      <p className="text-muted-foreground mb-8">Set rent and contract terms for commercial tenants.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <CurrencyField label="Monthly Rent" value={data.commercialMonthlyRent} onChange={(v) => onChange({ commercialMonthlyRent: v })} />
        <CurrencyField label="Security Deposit" value={data.commercialSecurityDeposit} onChange={(v) => onChange({ commercialSecurityDeposit: v })} />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Minimum Lease (months)</span>
          <input
            type="number"
            min={1}
            value={data.commercialMinimumLeaseMonths}
            onChange={(e) => onChange({ commercialMinimumLeaseMonths: Number(e.target.value) || 1 })}
            className="w-full rounded-xl border border-border px-4 py-3 bg-background"
          />
        </label>
        <CurrencyField label="Service Charges" value={data.commercialServiceCharge} onChange={(v) => onChange({ commercialServiceCharge: v })} />
      </div>
    </div>
  );
}
