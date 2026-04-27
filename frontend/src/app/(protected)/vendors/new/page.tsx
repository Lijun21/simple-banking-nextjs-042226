'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useCreateVendor } from '@/hooks/useVendors';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateVendorInput, PaymentMethod } from '@/types';

export default function NewVendorPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateVendorInput>();
  const { mutateAsync, isPending } = useCreateVendor();
  const router = useRouter();

  const onSubmit = async (data: CreateVendorInput) => {
    await mutateAsync(data);
    router.push('/vendors');
  };

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Add Vendor</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
        <Input label="Vendor Name" error={errors.name?.message}
          {...register('name', { required: 'Name is required' })} />
        <Input label="Vendor Email" type="email" error={errors.email?.message}
          {...register('email', { required: 'Email is required' })} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Payment Method</label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            {...register('paymentMethod', { required: true })}
          >
            <option value={PaymentMethod.ACH}>ACH Transfer</option>
            <option value={PaymentMethod.WIRE}>Wire Transfer</option>
            <option value={PaymentMethod.CHECK}>Check</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isPending}>Save Vendor</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

// Enum needed client-side
const PaymentMethod = { ACH: 'ach', WIRE: 'wire', CHECK: 'check' } as const;
