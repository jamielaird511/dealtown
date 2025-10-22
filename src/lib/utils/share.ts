export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
};

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // very old browsers fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
    return true;
  }
}

export function buildShareUrl(explicitUrl?: string) {
  if (explicitUrl) return explicitUrl;
  // Safe default: current page URL (no SSR access here; used only in client)
  return window.location.href;
}
