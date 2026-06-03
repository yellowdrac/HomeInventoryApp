import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormField, Input, Alert } from '@/core/components/ui';
import { getHouseholdErrorMessage } from '@features/Household/lib/householdErrors';
import { cn } from '@/core/lib/cn';
import { useCreateHousehold } from '@features/Household/hooks/useCreateHousehold';
import { useJoinHousehold } from '@features/Household/hooks/useJoinHousehold';
import {
  createHouseholdSchema,
  joinHouseholdSchema,
  type CreateHouseholdFormValues,
  type JoinHouseholdFormValues,
} from '@features/Household/schemas';

type Mode = 'create' | 'join';

/**
 * Onboarding for an authenticated user without a household: create a new one or
 * join an existing one via its code. Either action re-issues tokens with the
 * `householdId`, after which the guard lets the user into the app.
 */
export function HouseholdSetupView() {
  const [mode, setMode] = useState<Mode>('create');

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Set up your household
        </h1>
        <p className="text-slate-600">
          Create a new household or join an existing one to start sharing your
          inventory.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Household setup mode"
        className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
      >
        <ModeTab
          mode="create"
          activeMode={mode}
          onSelect={setMode}
          label="Create"
        />
        <ModeTab
          mode="join"
          activeMode={mode}
          onSelect={setMode}
          label="Join"
        />
      </div>

      {mode === 'create' ? <CreateForm /> : <JoinForm />}
    </section>
  );
}

interface ModeTabProps {
  mode: Mode;
  activeMode: Mode;
  onSelect: (mode: Mode) => void;
  label: string;
}

function ModeTab({ mode, activeMode, onSelect, label }: ModeTabProps) {
  const isActive = mode === activeMode;
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${mode}`}
      aria-selected={isActive}
      aria-controls={`panel-${mode}`}
      onClick={() => onSelect(mode)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600',
        isActive
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:text-slate-900',
      )}
    >
      {label}
    </button>
  );
}

function CreateForm() {
  const createHousehold = useCreateHousehold();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHouseholdFormValues>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = handleSubmit((values) => createHousehold.mutate(values));

  return (
    <form
      id="panel-create"
      role="tabpanel"
      aria-labelledby="tab-create"
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {createHousehold.isError ? (
        <Alert tone="error">{getHouseholdErrorMessage(createHousehold.error)}</Alert>
      ) : null}

      <FormField
        id="householdName"
        label="Household name"
        error={errors.name?.message}
      >
        {(aria) => (
          <Input placeholder="The Doe family" {...aria} {...register('name')} />
        )}
      </FormField>

      <Button
        type="submit"
        className="w-full"
        isLoading={createHousehold.isPending}
      >
        {createHousehold.isPending ? 'Creating...' : 'Create household'}
      </Button>
    </form>
  );
}

function JoinForm() {
  const joinHousehold = useJoinHousehold();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinHouseholdFormValues>({
    resolver: zodResolver(joinHouseholdSchema),
    defaultValues: { joinCode: '' },
  });

  const onSubmit = handleSubmit((values) => joinHousehold.mutate(values));

  return (
    <form
      id="panel-join"
      role="tabpanel"
      aria-labelledby="tab-join"
      onSubmit={onSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {joinHousehold.isError ? (
        <Alert tone="error">{getHouseholdErrorMessage(joinHousehold.error)}</Alert>
      ) : null}

      <FormField
        id="joinCode"
        label="Join code"
        hint="The 8-character code shared by the household owner."
        error={errors.joinCode?.message}
      >
        {(aria) => (
          <Input
            placeholder="ABCD1234"
            autoCapitalize="characters"
            {...aria}
            {...register('joinCode')}
          />
        )}
      </FormField>

      <Button
        type="submit"
        className="w-full"
        isLoading={joinHousehold.isPending}
      >
        {joinHousehold.isPending ? 'Joining...' : 'Join household'}
      </Button>
    </form>
  );
}
