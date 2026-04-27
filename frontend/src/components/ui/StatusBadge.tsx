import clsx from 'clsx';
import { PaymentOrderStatus, DisbursementStatus, ChargeStatus } from '@/types';

type Status = PaymentOrderStatus | DisbursementStatus | ChargeStatus;

const colorMap: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  queued: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  succeeded: 'bg-green-100 text-green-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', colorMap[status] ?? 'bg-gray-100 text-gray-700')}>
      {status}
    </span>
  );
}
