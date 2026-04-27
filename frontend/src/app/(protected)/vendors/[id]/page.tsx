'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useVendor, useUpdateVendor } from '@/hooks/useVendors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateVendorInput } from '@/types';

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const { data: vendor, isLoading } = useVendor(params.id);
  const { mutateAsync, isPending } = useUpdateVendor(params.id);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateVendorInput>();
  const router = useRouter();

  if (isLoading) return <p className="text-gray-400">Loading...</p>;
  if (!vendor) return <p className="text-red-500">Vendor not found</p>;

  const onSubmit = async (data: CreateVendorInput) => {
    await mutateAsync(data);
    router.push('/vendors');
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Edit Vendor</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <Input label="Vendor Name" defaultValue={vendor.name} error={errors.name?.message}
          {...register('name', { required: 'Name is required' })} />
        <Input label="Vendor Email" type="email" defaultValue={vendor.email} error={errors.email?.message}
          {...register('email', { required: 'Email is required' })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Payment Method</label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            defaultValue={vendor.paymentMethod}
            {...register('paymentMethod')}
          >
            <option value="ach">ACH Transfer</option>
            <option value="wire">Wire Transfer</option>
            <option value="check">Check</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isPending}>Save Changes</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
