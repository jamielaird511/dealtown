"use client";

import { ButtonHTMLAttributes, useState } from "react";

export default function ConfirmDeleteButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { message?: string }
) {
  const { message = "Delete this item?", ...rest } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <button
      type="submit"
      {...rest}
      disabled={isDeleting}
      onClick={async (e) => {
        if (!confirm(message)) {
          e.preventDefault();
          return;
        }
        
        setIsDeleting(true);
        
        // Let the form submission proceed
        // The server action will handle the actual deletion
        // and redirect with success/error message
      }}
      className={
        "text-red-600 hover:underline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed " +
        (rest.className ?? "")
      }
    >
      {isDeleting ? (
        <>
          <span aria-hidden>⏳</span> Deleting...
        </>
      ) : (
        <>
          <span aria-hidden>🗑️</span> Delete
        </>
      )}
    </button>
  );
}

