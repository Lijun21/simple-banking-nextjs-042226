'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVendors } from '@/hooks/useVendors';
import { useCreatePaymentOrder, usePayOrder } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCents, paymentMethodLabel } from '@/lib/formatters';
import { Vendor, PaymentOrder } from '@/types';

type Step = 1 | 2 | 3 | 4 | 5;

interface WizardState {
  vendor: Vendor | null;
  amountCents: number;
  memo: string;
  order: PaymentOrder | null;
  stripePaymentMethodId: string;
}

export default function NewPaymentPage() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<WizardState>({
    vendor: null, amountCents: 0, memo: '', order: null, stripePaymentMethodId: '',
  });
  const { data: vendors } = useVendors();
  const createOrder = useCreatePaymentOrder();
  const router = useRouter();

  const feeCents = Math.round(state.amountCents * 0.029);
  const totalCents = state.amountCents + feeCents;

  // Step 1: Select vendor
  if (step === 1) return (
    <StepWrapper title="Step 1: Select Vendor" step={1}>
      <div className="space-y-3">
        {vendors?.map((v) => (
          <button key={v.id} onClick={() => { setState((s) => ({ ...s, vendor: v })); setStep(2); }}
            className="w-full text-left rounded-xl border-2 border-gray-200 hover:border-blue-400 p-4 transition">
            <p className="font-semibold">{v.name}</p>
            <p className="text-sm text-gray-500">{v.email} · {paymentMethodLabel(v.paymentMethod)}</p>
          </button>
        ))}
        {!vendors?.length && <p className="text-gray-400">No vendors yet. <a href="/vendors/new" className="text-blue-600 underline">Add one</a></p>}
      </div>
    </StepWrapper>
  );

  // Step 2: Amount + memo
  if (step === 2) return (
    <StepWrapper title="Step 2: Enter Amount" step={2} onBack={() => setStep(1)}>
      <div className="space-y-4">
        <p className="text-gray-600">Paying: <strong>{state.vendor?.name}</strong></p>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">$</span>
            <input
              type="number" min="1" step="0.01"
              className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm"
              onChange={(e) => setState((s) => ({ ...s, amountCents: Math.round(parseFloat(e.target.value) * 100) || 0 }))}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Memo (optional)</label>
          <input type="text" className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onChange={(e) => setState((s) => ({ ...s, memo: e.target.value }))} />
        </div>
        <Button onClick={() => state.amountCents > 0 && setStep(3)} disabled={state.amountCents === 0}>Continue</Button>
      </div>
    </StepWrapper>
  );

  // Step 3: Review
  if (step === 3) return (
    <StepWrapper title="Step 3: Review" step={3} onBack={() => setStep(2)}>
      <div className="space-y-4">
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-2 text-sm">
          <Row label="To" value={state.vendor?.name ?? ''} />
          <Row label="Payment method" value={paymentMethodLabel(state.vendor?.paymentMethod ?? '')} />
          <Row label="Amount" value={formatCents(state.amountCents)} />
          <Row label="Service fee (~2.9%)" value={formatCents(feeCents)} />
          <div className="border-t pt-2 mt-2">
            <Row label="Total charged to card" value={formatCents(totalCents)} bold />
          </div>
          {state.memo && <Row label="Memo" value={state.memo} />}
        </div>
        <Button onClick={async () => {
          const order = await createOrder.mutateAsync({ vendorId: state.vendor!.id, amountCents: state.amountCents, memo: state.memo });
          setState((s) => ({ ...s, order }));
          setStep(4);
        }} isLoading={createOrder.isPending}>
          Proceed to Payment
        </Button>
      </div>
    </StepWrapper>
  );

  // Step 4: Credit card (Stripe)
  if (step === 4) {
    const payOrder = usePayOrder(state.order?.id ?? '');
    return (
      <StepWrapper title="Step 4: Credit Card" step={4} onBack={() => setStep(3)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Enter your credit card details to charge <strong>{formatCents(totalCents)}</strong>.
          </p>
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
            Stripe Elements mount here
            <br />
            <span className="text-xs">(integrate <code>@stripe/react-stripe-js</code> PaymentElement)</span>
          </div>
          <Input
            label="Simulated Stripe Payment Method ID (for testing)"
            placeholder="pm_card_visa"
            onChange={(e) => setState((s) => ({ ...s, stripePaymentMethodId: e.target.value }))}
          />
          <Button onClick={async () => {
            await payOrder.mutateAsync({ stripePaymentMethodId: state.stripePaymentMethodId || 'pm_card_visa' });
            setStep(5);
          }} isLoading={payOrder.isPending}>
            Pay {formatCents(totalCents)}
          </Button>
        </div>
      </StepWrapper>
    );
  }

  // Step 5: Confirmation
  return (
    <StepWrapper title="Payment Submitted!" step={5}>
      <div className="text-center space-y-4">
        <div className="text-5xl">✓</div>
        <p className="text-gray-600">Your payment of <strong>{formatCents(state.amountCents)}</strong> to <strong>{state.vendor?.name}</strong> is being processed.</p>
        <p className="text-sm text-gray-400">Confirmation emails have been sent to you and the vendor.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => router.push('/transactions')}>View Transactions</Button>
          <Button variant="secondary" onClick={() => router.push('/payments/new')}>New Payment</Button>
        </div>
      </div>
    </StepWrapper>
  );
}

function StepWrapper({ title, step, children, onBack }: { title: string; step: number; children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="text-xs text-gray-400">Step {step} of 5</p>
        <h1 className="text-2xl font-bold mt-1">{title}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">{children}</div>
      {onBack && <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold text-base' : ''}`}>
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
