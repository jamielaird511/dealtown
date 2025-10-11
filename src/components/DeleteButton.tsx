'use client';
import { Trash2 } from 'lucide-react';

export function DeleteButton({ id, title }: { id: number; title?: string }) {
  return (
    <form 
      action={`/api/admin/deals/${id}`} 
      method="post" 
      onSubmit={(e) => {
        if (!confirm(`Delete "${title ?? 'this deal'}"?`)) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="_action" value="delete" />
      <button type="submit" className="text-sm text-red-600 hover:underline inline-flex items-center gap-1">
        <Trash2 size={14} />
        Delete
      </button>
    </form>
  );
}
