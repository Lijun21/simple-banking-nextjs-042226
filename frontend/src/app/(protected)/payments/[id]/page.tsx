'use client';
import { useTransaction } from '@/hooks/useTransactions';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCents, formatDate, paymentMethodLabel } from '@/lib/formatters';
import Link from 'next/link';

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const { data: order, isLoading } = useTransaction(params.id);

  if (isLoading) return <p className="text-gray-400">Loading...</p>;
  if (!order) return <p className="text-red-500">Payment not found</p>;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment Detail</h1>
        <StatusBadge status={order.status} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 text-sm">
        <Row label="Confirmation #" value={order.id.slice(0, 8).toUpperCase()} />
        <Row label="Vendor" value={order.vendor?.name ?? '—'} />
        <Row label="Payment Method" value={paymentMethodLabel(order.vendor?.paymentMethod ?? '')} />
        <Row label="Amount Sent" value={formatCents(order.amountCents)} />
        <Row label="Service Fee" value={formatCents(order.feeCents)} />
        <Row label="Total Charged" value={formatCents(order.totalCents)} bold />
        {order.memo && <Row label="Memo" value={order.memo} />}
        <Row label="Date" value={formatDate(order.createdAt)} />
      </div>
      <Link href="/transactions" className="text-sm text-blue-600 hover:underline">← Back to Transactions</Link>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-semibold' : ''}`}>
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
