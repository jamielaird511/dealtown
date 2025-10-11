'use client';
import { useTransition, useState } from 'react';

export function ActiveToggle({ id, initial }: { id: number; initial: boolean }) {
  const [isActive, setIsActive] = useState(initial);
  const [pending, start] = useTransition();

  return (
    <button
      className={`rounded px-2 py-1 text-sm ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
      disabled={pending}
      onClick={() => {
        const next = !isActive;
        setIsActive(next); // optimistic
        start(async () => {
          const res = await fetch(`/api/admin/deals/${id}`, {
            method: 'PATCH',
            headers: {'content-type':'application/json'},
            body: JSON.stringify({ is_active: next }),
          });
          if (!res.ok) { setIsActive(!next); alert('Failed to update'); }
        });
      }}
    >
      {pending ? '…' : isActive ? 'Active' : 'Inactive'}
    </button>
  );
}

