import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, FormField, Input, Alert } from '@/core/components/ui';
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from '@/core/components/icons';
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
  const { t } = useTranslation();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
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
      title={t('auth.registerTitle')}
      description={t('auth.registerDescription')}
      footer={
        <>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            {t('auth.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {registerMutation.isError ? (
          <Alert tone="error">
            {getAuthErrorMessage(registerMutation.error)}
          </Alert>
        ) : null}

        <FormField
          id="displayName"
          label={t('auth.displayName')}
          error={errors.displayName?.message}
        >
          {(aria) => (
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                autoComplete="name"
                placeholder="Alex Doe"
                className="pl-10"
                {...aria}
                {...register('displayName')}
              />
            </div>
          )}
        </FormField>

        <FormField id="email" label={t('auth.email')} error={errors.email?.message}>
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
          label={t('auth.password')}
          hint={t('auth.passwordHint')}
          error={errors.password?.message}
        >
          {(aria) => (
            <div className="relative">
              <LockIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="pl-10 pr-10"
                {...aria}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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

        <Button
          type="submit"
          className="w-full"
          isLoading={registerMutation.isPending}
        >
          {registerMutation.isPending
            ? t('auth.creatingAccount')
            : t('auth.createAccount')}
        </Button>
      </form>
    </AuthCard>
  );
}
