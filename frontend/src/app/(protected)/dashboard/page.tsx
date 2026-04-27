'use client';
import Link from 'next/link';
import { useTransactions } from '@/hooks/useTransactions';
import { useVendors } from '@/hooks/useVendors';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatCents, formatDate } from '@/lib/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: txns } = useTransactions(1);
  const { data: vendors } = useVendors();

  const recent = txns?.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {user?.companyName}</h1>
        <p className="text-gray-500 mt-1">Pay vendors with your credit card</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-3xl font-bold mt-1">{txns?.total ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Vendors</p>
          <p className="text-3xl font-bold mt-1">{vendors?.length ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <Link href="/payments/new">
            <Button className="w-full">+ New Payment</Button>
          </Link>
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Link href="/transactions" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{tx.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3">{formatCents(tx.amountCents)}</td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
