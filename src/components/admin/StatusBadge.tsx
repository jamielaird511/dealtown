export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
        (active
          ? "bg-green-100 text-green-800 ring-1 ring-green-200"
          : "bg-gray-100 text-gray-600 ring-1 ring-gray-200")
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

