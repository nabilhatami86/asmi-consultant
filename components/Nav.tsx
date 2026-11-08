"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard Hub" },
  { href: "/", label: "Konsultasi Dupe" },
  { href: "/konsultasi", label: "Konsultasi & Simulasi Modal" },
  { href: "/peluang", label: "Peta Peluang" },
  { href: "/formula", label: "Formula Lab" },
  { href: "/scouting", label: "Scouting" },
];

export default function Nav() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-lg tracking-wide">
          ASMI <span className="text-gold-600">Consultant</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 transition ${
                path === l.href
                  ? "bg-ink text-white"
                  : "text-stone-600 hover:bg-sand-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden items-center justify-center rounded-lg p-2 text-stone-600 hover:bg-sand-100 focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <nav className="border-b border-sand-200 bg-sand-50 px-4 py-3 md:hidden flex flex-col gap-1.5 shadow-lg">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setIsOpen(false)}
              className={`rounded-xl px-4 py-2.5 text-sm transition ${
                path === l.href
                  ? "bg-ink text-white font-medium"
                  : "text-stone-700 hover:bg-sand-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
