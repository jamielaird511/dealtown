"use client";

import { ButtonHTMLAttributes } from "react";

export default function ConfirmDeleteButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { message?: string }
) {
  const { message = "Delete this item?", ...rest } = props;
  return (
    <button
      type="submit"
      {...rest}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className={
        "text-red-600 hover:underline inline-flex items-center gap-1 " +
        (rest.className ?? "")
      }
    >
      <span aria-hidden>🗑️</span> Delete
    </button>
  );
}

