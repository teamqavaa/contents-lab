'use client';

import { useSyncExternalStore } from 'react';

function greetingFor(hour: number) {
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const subscribe = () => () => {};

/** Salutation selon l'heure locale du navigateur ("Hello" pendant le rendu serveur). */
export default function Greeting({ firstName }: { firstName: string }) {
  const greeting = useSyncExternalStore(
    subscribe,
    () => greetingFor(new Date().getHours()),
    () => 'Hello',
  );

  return (
    <h3 className="text-lg font-bold text-neutral-900">
      {greeting}
      {firstName ? ` ${firstName}` : ''} <span aria-hidden="true">🔥</span>
    </h3>
  );
}
