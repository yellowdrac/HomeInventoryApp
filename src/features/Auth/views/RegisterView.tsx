import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { Button, FormField, Input, Alert } from '@/core/components/ui';
import { getAuthErrorMessage } from '@features/Auth/lib/authErrors';
import { AuthCard } from '@features/Auth/components/AuthCard';
import { useRegister } from '@features/Auth/hooks/useRegister';
import {
  registerSchema,
  type RegisterFormValues,
} from '@features/Auth/schemas';

/**
 * Registration form. On success the user is authenticated but has no household,
 * so the route guard sends them to the household setup view.
 */
export function RegisterView() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', displayName: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => registerMutation.mutate(values));

  return (
    <AuthCard
      title="Create your account"
      description="Set up HomeInventory to start tracking your household."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {registerMutation.isError ? (
          <Alert tone="error">
            {getAuthErrorMessage(registerMutation.error)}
          </Alert>
        ) : null}

        <FormField
          id="displayName"
          label="Display name"
          error={errors.displayName?.message}
        >
          {(aria) => (
            <Input
              autoComplete="name"
              placeholder="Alex Doe"
              {...aria}
              {...register('displayName')}
            />
          )}
        </FormField>

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
          hint="At least 8 characters."
          error={errors.password?.message}
        >
          {(aria) => (
            <Input
              type="password"
              autoComplete="new-password"
              {...aria}
              {...register('password')}
            />
          )}
        </FormField>

        <Button
          type="submit"
          className="w-full"
          isLoading={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? 'Creating account...'
            : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  );
}
