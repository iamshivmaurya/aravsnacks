'use client';
import CustomerForm  from '@/components/admin/CustomerForm';
import { useRouter } from 'next/navigation';

export default function AddCustomerPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Add New Customer</h2>
      <CustomerForm onSuccess={() => router.push('/admin/customers')} />
    </div>
  );
}
