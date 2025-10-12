import Link from "next/link";

export function ActionLinks({ editHref, onDelete }: { editHref: string; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href={editHref} className="text-blue-600 hover:underline">
        Edit
      </Link>
      <button
        type="button"
        className="flex items-center gap-1 text-red-600 hover:underline"
        onClick={onDelete}
      >
        <span aria-hidden>🗑️</span> Delete
      </button>
    </div>
  );
}

