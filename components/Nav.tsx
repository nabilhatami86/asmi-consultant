"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Konsultasi AI" },
  { href: "/dashboard", label: "Dashboard Hub" },
  { href: "/formula", label: "Formula Lab" },
  { href: "/peluang", label: "Peta Peluang" },
  { href: "/scouting", label: "Scouting" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-10 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg tracking-wide">
          ASMI <span className="text-gold-600">Consultant</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 transition ${
                path === l.href ? "bg-ink text-white" : "text-stone-600 hover:bg-sand-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
