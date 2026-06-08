import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Button, FormField, Input, Alert } from '@/core/components/ui';
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '@/core/components/icons';
import { getAuthErrorMessage } from '@features/Auth/lib/authErrors';
import { AuthCard } from '@features/Auth/components/AuthCard';
import { useLogin } from '@features/Auth/hooks/useLogin';
import { loginSchema, type LoginFormValues } from '@features/Auth/schemas';

/**
 * Login form. Validates with zod, submits via the `useLogin` mutation and shows
 * accessible field-level and form-level errors. The route guard redirects away
 * once the session is established.
 */
export function LoginView() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your HomeInventory account."
      footer={
        <>
          Do not have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {login.isError ? (
          <Alert tone="error">{getAuthErrorMessage(login.error)}</Alert>
        ) : null}

        <FormField id="email" label="Email" error={errors.email?.message}>
          {(aria) => (
            <div className="relative">
              <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-10"
                {...aria}
                {...register('email')}
              />
            </div>
          )}
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          {(aria) => (
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="pl-10 pr-10"
                {...aria}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-5" />
                ) : (
                  <EyeIcon className="size-5" />
                )}
              </button>
            </div>
          )}
        </FormField>

        <Button type="submit" className="w-full" isLoading={login.isPending}>
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}
