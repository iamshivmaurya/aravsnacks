'use client';
import LoginForm, { LoginData } from '../../components/LoginForm';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();

  const handleLoginSuccess = (data: LoginData) => {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('phone', data.phone);
    localStorage.setItem('customer_id', data.customer_id);
    router.push('/'); // Login ke baad homepage
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <LoginForm onSubmit={handleLoginSuccess} />
      </div>
    </div>
  );
}
