'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTransactions } from '@/hooks/useTransactions';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatCents, formatDate } from '@/lib/formatters';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTransactions(page);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : !data?.data?.length ? (
        <p className="text-gray-400">No transactions yet.</p>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Fee</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/transactions/${tx.id}`} className="text-blue-600 hover:underline font-mono">
                        {tx.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">{tx.vendor?.name ?? '—'}</td>
                    <td className="px-4 py-3">{formatCents(tx.amountCents)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatCents(tx.feeCents)}</td>
                    <td className="px-4 py-3 font-semibold">{formatCents(tx.totalCents)}</td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <Button variant="secondary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
