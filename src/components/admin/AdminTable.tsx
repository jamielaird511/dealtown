import { ReactNode } from "react";

export function AdminTable({
  head,
  children,
}: {
  head: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="w-full table-auto">
        <thead className="bg-gray-50 text-left text-sm text-gray-600">
          {head}
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">{children}</tbody>
      </table>
    </div>
  );
}

