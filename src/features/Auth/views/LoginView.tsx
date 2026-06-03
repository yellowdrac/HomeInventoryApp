import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Button, FormField, Input, Alert } from '@/core/components/ui';
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
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {login.isError ? (
          <Alert tone="error">{getAuthErrorMessage(login.error)}</Alert>
        ) : null}

        <FormField id="email" label="Email" error={errors.email?.message}>
          {(aria) => (
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...aria}
              {...register('email')}
            />
          )}
        </FormField>

        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          {(aria) => (
            <Input
              type="password"
              autoComplete="current-password"
              {...aria}
              {...register('password')}
            />
          )}
        </FormField>

        <Button type="submit" className="w-full" isLoading={login.isPending}>
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}
