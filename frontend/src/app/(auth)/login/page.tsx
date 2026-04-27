'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const { login, isLoggingIn, loginError } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    await login(data);
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Sign in</h2>
      {loginError && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          Invalid email or password
        </p>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password', { required: 'Password is required' })}
      />
      <Button type="submit" isLoading={isLoggingIn}>Sign in</Button>
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </form>
  );
}
