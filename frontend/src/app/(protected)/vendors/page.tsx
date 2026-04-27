'use client';
import Link from 'next/link';
import { useVendors, useDeleteVendor } from '@/hooks/useVendors';
import { Button } from '@/components/ui/Button';
import { paymentMethodLabel } from '@/lib/formatters';

export default function VendorsPage() {
  const { data: vendors, isLoading } = useVendors();
  const { mutate: deleteVendor } = useDeleteVendor();

  if (isLoading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Link href="/vendors/new"><Button>+ Add Vendor</Button></Link>
      </div>

      {!vendors?.length ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400 mb-4">No vendors yet</p>
          <Link href="/vendors/new"><Button>Add your first vendor</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div>
                <p className="font-semibold">{vendor.name}</p>
                <p className="text-sm text-gray-500">{vendor.email} · {paymentMethodLabel(vendor.paymentMethod)}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/vendors/${vendor.id}`}>
                  <Button variant="secondary" className="text-xs px-3 py-1.5">Edit</Button>
                </Link>
                <Button
                  variant="danger"
                  className="text-xs px-3 py-1.5"
                  onClick={() => { if (confirm('Delete this vendor?')) deleteVendor(vendor.id); }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
