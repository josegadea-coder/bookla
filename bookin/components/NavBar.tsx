import Link from "next/link";

export default function NavBar() {
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-700 text-lg tracking-tight flex items-center gap-2">
          <span className="status-dot status-dot--available" aria-hidden />
          Bookin
        </Link>
        <nav className="flex items-center gap-6 font-mono text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink focus-ring rounded">
            Equipment
          </Link>
          <Link href="/my-bookings" className="hover:text-ink focus-ring rounded">
            My bookings
          </Link>
          <Link href="/admin" className="hover:text-ink focus-ring rounded">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
