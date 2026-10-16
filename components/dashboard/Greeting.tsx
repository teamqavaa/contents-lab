'use client';

import { useSyncExternalStore } from 'react';

function greetingFor(hour: number) {
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const subscribe = () => () => {};

/** Salutation selon l'heure locale du navigateur ("Hello" pendant le rendu serveur). */
export default function Greeting({
  firstName,
  as: Tag = 'h3',
  emoji = '🔥',
  className = 'text-lg font-bold text-neutral-900',
}: {
  firstName: string;
  as?: 'h1' | 'h3';
  emoji?: string;
  className?: string;
}) {
  const greeting = useSyncExternalStore(
    subscribe,
    () => greetingFor(new Date().getHours()),
    () => 'Hello',
  );

  return (
    <Tag className={className}>
      {greeting}
      {firstName ? `, ${firstName}` : ''} <span aria-hidden="true">{emoji}</span>
    </Tag>
  );
}
