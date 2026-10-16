import { getInitials } from '@/lib/initials';

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

/** Photo de profil si elle existe, sinon les initiales de l'utilisateur. */
export default function UserAvatar({ name, email, avatarUrl, size = 40, className = '' }: UserAvatarProps) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar servi par le SSO (domaine variable)
      <img
        src={avatarUrl}
        alt={name || 'User avatar'}
        style={style}
        className={`rounded-full object-cover bg-neutral-100 shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      style={style}
      aria-label={name || email || 'User'}
      className={`rounded-full bg-[#ece9fd] text-[#4f3fd6] font-bold flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {getInitials(name, email)}
    </span>
  );
}
