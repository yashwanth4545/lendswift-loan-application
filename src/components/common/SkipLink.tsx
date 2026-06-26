/** WCAG 2.4.1 — bypass block: skip sticky header / progress to main form */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-lendswift-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to application form
    </a>
  );
}
