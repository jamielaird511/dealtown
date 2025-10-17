export default function ActivePill({ active }: { active: boolean }) {
  if (!active) {
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
        Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
      Active
    </span>
  );
}
