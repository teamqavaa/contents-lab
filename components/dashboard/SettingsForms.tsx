'use client';

import { useActionState, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

import {
  changePasswordAction,
  updateAccountAction,
  updateProfileAction,
  type SettingsState,
  type UserProfile,
} from '@/actions/settings';
import type { ConnectedUser } from '@/actions/user';
import UserAvatar from './UserAvatar';

const INITIAL: SettingsState = { ok: false, message: '' };

const TABS = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const inputClass =
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-[#6d5deb] focus:ring-2 focus:ring-[#6d5deb]/15 disabled:bg-neutral-50 disabled:text-neutral-500';

function Field({
  label, name, error, children,
}: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={name} className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-neutral-600">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Feedback({ state }: { state: SettingsState }) {
  if (!state.message) return null;
  const Icon = state.ok ? CheckCircle2 : AlertCircle;
  return (
    <p role="status" className={`flex items-center gap-2 text-sm ${state.ok ? 'text-emerald-600' : 'text-red-600'}`}>
      <Icon className="w-4 h-4" />
      {state.message}
    </p>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 self-start rounded-full bg-[#6d5deb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5a4ad6] disabled:opacity-60"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {label}
    </button>
  );
}

function AccountForm({ user }: { user: ConnectedUser }) {
  const [state, action, pending] = useActionState(updateAccountAction, INITIAL);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name" name="name" error={state.errors?.name}>
          <input id="name" name="name" defaultValue={user.name} className={inputClass} />
        </Field>
        <Field label="Phone" name="phone" error={state.errors?.phone}>
          <input id="phone" name="phone" type="tel" defaultValue={user.phone || ''} className={inputClass} />
        </Field>
        <Field label="Email" name="email">
          <input id="email" value={user.email} disabled className={inputClass} />
        </Field>
        <Field label="Sign-in method" name="auth_provider">
          <input id="auth_provider" value={user.auth_provider} disabled className={`${inputClass} capitalize`} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        {user.roles?.map((role) => (
          <span key={role} className="rounded-full bg-[#ece9fd] px-3 py-1 text-xs font-semibold capitalize text-[#4f3fd6]">
            {role}
          </span>
        ))}
      </div>
      <Feedback state={state} />
      <SubmitButton pending={pending} label="Save account" />
    </form>
  );
}

function ProfileForm({ user, profile }: { user: ConnectedUser; profile: UserProfile | null }) {
  const [state, action, pending] = useActionState(updateProfileAction, INITIAL);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name} email={user.email} avatarUrl={preview || profile?.avatar} size={72} />
        <Field label="Profile picture" name="avatar_file" error={state.errors?.avatar_file}>
          <input
            id="avatar_file"
            name="avatar_file"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-[#ece9fd] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#4f3fd6]"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Display name" name="full_name" error={state.errors?.full_name}>
          <input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} className={inputClass} />
        </Field>
        <Field label="Birth date" name="birth_date" error={state.errors?.birth_date}>
          <input id="birth_date" name="birth_date" type="date" defaultValue={profile?.birth_date || ''} className={inputClass} />
        </Field>
        <Field label="Language" name="language" error={state.errors?.language}>
          <select id="language" name="language" defaultValue={profile?.language || 'en'} className={inputClass}>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </Field>
      </div>
      <Field label="Bio" name="bio" error={state.errors?.bio}>
        <textarea id="bio" name="bio" rows={4} maxLength={300} defaultValue={profile?.bio || ''} className={inputClass} />
      </Field>
      <Feedback state={state} />
      <SubmitButton pending={pending} label="Save profile" />
    </form>
  );
}

function SecurityForm({ user }: { user: ConnectedUser }) {
  const [state, action, pending] = useActionState(changePasswordAction, INITIAL);

  if (user.auth_provider !== 'local') {
    return (
      <p className="text-sm text-neutral-500">
        You sign in with <span className="font-semibold capitalize">{user.auth_provider}</span>: your password is
        managed by that provider.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <Field label="Current password" name="current_password" error={state.errors?.current_password}>
        <input id="current_password" name="current_password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      <Field label="New password" name="new_password" error={state.errors?.new_password}>
        <input id="new_password" name="new_password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <Field label="Confirm new password" name="confirm_password" error={state.errors?.confirm_password}>
        <input id="confirm_password" name="confirm_password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} />
      </Field>
      <Feedback state={state} />
      <SubmitButton pending={pending} label="Change password" />
    </form>
  );
}

/** Onglet « Setting » : compte et profil du SSO, mot de passe. */
export default function SettingsForms({ user, profile }: { user: ConnectedUser; profile: UserProfile | null }) {
  const [tab, setTab] = useState<TabId>('account');

  return (
    <section className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your Qavaa account, shared by all Qavaa applications.</p>
      </div>

      <div role="tablist" aria-label="Settings" className="flex gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === id ? 'bg-[#6d5deb] text-white' : 'bg-white text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="rounded-3xl bg-white p-6">
        {tab === 'account' && <AccountForm user={user} />}
        {tab === 'profile' && <ProfileForm user={user} profile={profile} />}
        {tab === 'security' && <SecurityForm user={user} />}
      </div>
    </section>
  );
}
