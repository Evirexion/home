import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M15 8.5h-2c-.9 0-1.5.6-1.5 1.5v2h3.3l-.5 3h-2.8v7.5h-3V15h-2.2v-3H10V9.6C10 7 11.6 5 14.1 5H16v3.1Z" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16.5 3.5c.4 2.2 1.9 3.7 4 4v3c-1.5.1-2.9-.4-4-1.3v6.4a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.07v3.1a2.3 2.3 0 1 0 1.6 2.2V3.5h2.9Z" />
    </svg>
  );
}
