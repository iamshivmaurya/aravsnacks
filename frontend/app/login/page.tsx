'use client';
import SignInForm, { LoginData } from '../../components/SignInForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md">
        <SignInForm/>
      </div>
    </div>
  );
}
