'use client';
import CategoryForm  from '@/components/admin/CategoryForm';
import { useRouter } from 'next/navigation';

export default function AddCategoryPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Add New Category</h2>
      <CategoryForm onSuccess={() => router.push('/admin/categories')} />
    </div>
  );
}
