'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTransaction } from '@/hooks/useTransactions';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCents, formatDate, paymentMethodLabel } from '@/lib/formatters';

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tx, isLoading } = useTransaction(id);

  if (isLoading) return <p className="text-gray-400">Loading…</p>;
  if (!tx) return <p className="text-gray-400">Transaction not found.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/transactions" className="text-blue-600 text-sm hover:underline">
          ← Back to Transactions
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">Transaction Detail</h1>
            <p className="text-gray-500 text-sm font-mono mt-1">#{tx.id}</p>
          </div>
          <StatusBadge status={tx.status} />
        </div>

        <hr />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-gray-500 uppercase text-xs font-medium">Vendor</span>
            <span className="font-semibold">{tx.vendor?.name ?? '—'}</span>
          </div>
          <div>
            <span className="block text-gray-500 uppercase text-xs font-medium">Payment Method</span>
            <span className="font-semibold">{tx.vendor?.paymentMethod ? paymentMethodLabel(tx.vendor.paymentMethod) : '—'}</span>
          </div>
          <div>
            <span className="block text-gray-500 uppercase text-xs font-medium">Amount</span>
            <span className="font-semibold">{formatCents(tx.amountCents)}</span>
          </div>
          <div>
            <span className="block text-gray-500 uppercase text-xs font-medium">Fee</span>
            <span className="font-semibold">{formatCents(tx.feeCents)}</span>
          </div>
          <div>
            <span className="block text-gray-500 uppercase text-xs font-medium">Total Charged</span>
            <span className="font-semibold text-lg">{formatCents(tx.totalCents)}</span>
          </div>
          <div>
            <span className="block text-gray-500 uppercase text-xs font-medium">Date</span>
            <span className="font-semibold">{formatDate(tx.createdAt)}</span>
          </div>
          {tx.memo && (
            <div className="col-span-2">
              <span className="block text-gray-500 uppercase text-xs font-medium">Memo</span>
              <span className="font-semibold">{tx.memo}</span>
            </div>
          )}
        </div>
      </div>

      {tx.creditCardCharge && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-700">Credit Card Charge</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Status</span>
              <StatusBadge status={tx.creditCardCharge.status} />
            </div>
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Amount</span>
              <span className="font-semibold">{formatCents(tx.creditCardCharge.amountCents)}</span>
            </div>
            {tx.creditCardCharge.processorRef && (
              <div className="col-span-2">
                <span className="block text-gray-500 uppercase text-xs font-medium">Processor Reference</span>
                <span className="font-mono text-xs">{tx.creditCardCharge.processorRef}</span>
              </div>
            )}
            {tx.creditCardCharge.chargedAt && (
              <div>
                <span className="block text-gray-500 uppercase text-xs font-medium">Charged At</span>
                <span className="font-semibold">{formatDate(tx.creditCardCharge.chargedAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {tx.disbursement && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-700">Disbursement</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Status</span>
              <StatusBadge status={tx.disbursement.status} />
            </div>
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Amount</span>
              <span className="font-semibold">{formatCents(tx.disbursement.amountCents)}</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Method</span>
              <span className="font-semibold">{paymentMethodLabel(tx.disbursement.method)}</span>
            </div>
            {tx.disbursement.scheduledAt && (
              <div>
                <span className="block text-gray-500 uppercase text-xs font-medium">Scheduled At</span>
                <span className="font-semibold">{formatDate(tx.disbursement.scheduledAt)}</span>
              </div>
            )}
            {tx.disbursement.sentAt && (
              <div>
                <span className="block text-gray-500 uppercase text-xs font-medium">Sent At</span>
                <span className="font-semibold">{formatDate(tx.disbursement.sentAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {tx.fee && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-700">Fee Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Type</span>
              <span className="font-semibold capitalize">{tx.fee.feeType}</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Rate</span>
              <span className="font-semibold">{(Number(tx.fee.rate) * 100).toFixed(2)}%</span>
            </div>
            <div>
              <span className="block text-gray-500 uppercase text-xs font-medium">Fee Amount</span>
              <span className="font-semibold">{formatCents(tx.fee.amountCents)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
