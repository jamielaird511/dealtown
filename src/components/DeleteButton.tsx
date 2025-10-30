"use client";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id, title }: { id: string | number; title?: string }) {
  const idStr = String(id);
  return (
    <form
      action={`/api/admin/deals/${idStr}`}
      method="post"
      onSubmit={(e) => {
        if (!confirm(`Delete "${title ?? "this deal"}"?`)) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="_action" value="delete" />
      {/* if needed elsewhere: send string id in body */}
      {/* <input type="hidden" name="id" value={idStr} /> */}
      <button
        type="submit"
        className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
      >
        <Trash2 size={14} />
        Delete
      </button>
    </form>
  );
}
