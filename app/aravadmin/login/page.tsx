'use client';

import { useRouter } from 'next/navigation';
import AdminLoginForm, { AdminLoginData } from '../../../components/admin/AdminLoginForm';

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (data: AdminLoginData) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_name', data.user_name);
    localStorage.setItem('admin_id', data.admin_id);

    router.push('/aravadmin/dashboard'); // login ke baad admin dashboard pe bhej do
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AdminLoginForm onSubmit={handleLoginSuccess} />
    </div>
  );
}
