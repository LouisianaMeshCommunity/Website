"use client";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import Link from "next/link";

type Theme = "light" | "dark";

// ---------------- THEME HOOK ----------------
const useTheme = () => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme");
      return (
        (storedTheme as Theme) ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light")
      );
    }
    return "light";
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const rawSetTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === "dark";

    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(isDark ? "dark" : "light");

    window.localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return [theme, setTheme] as const;
};

// ---------------- NAVBAR ----------------
type NavbarProps = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

const Navbar = ({ theme, setTheme }: NavbarProps) => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-gray-900 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <Link
          href="/"
          className="text-xl font-bold text-white drop-shadow dark:text-gray-100"
        >
          LA Mesh
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center text-white dark:text-gray-100 font-medium">
          <Link href="/" className="hover:text-indigo-300 transition">
            Home
          </Link>
          <Link href="/links" className="hover:text-indigo-300 transition">
            Links
          </Link>
          <a
            href="https://discord.louisianamesh.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300 transition"
          >
            Discord
          </a>
          <a
            href="https://github.com/LouisianaMeshCommunity/Website"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300 transition"
          >
            GitHub
          </a>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="ml-4 p-2 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 text-white shadow transition-transform duration-300 hover:scale-110"
          >
            {theme === "dark" ? (
              <Image
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/508131/moon.svg"
                alt="Moon"
                width={20}
                height={20}
              />
            ) : (
              <Image
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/535669/sun.svg"
                alt="Sun"
                width={20}
                height={20}
              />
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/20 transition"
        >
          {navOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {navOpen && (
        <div className="md:hidden bg-black/70 text-white px-4 py-3 space-y-2 backdrop-blur-sm">
          <Link href="/" onClick={() => setNavOpen(false)}>
            Home
          </Link>
          <Link href="/links" onClick={() => setNavOpen(false)}>
            Links
          </Link>
          <a
            href="https://discord.louisianamesh.org"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            onClick={() => setNavOpen(false)}
          >
            Discord
          </a>
          <a
            href="https://github.com/LouisianaMeshCommunity/Website"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            onClick={() => setNavOpen(false)}
          >
            GitHub
          </a>
          <button
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setNavOpen(false);
            }}
            className="mt-3 p-2 rounded-lg bg-white/20 hover:bg-white/30"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      )}
    </nav>
  );
};

interface LinkItem {
  title: string;
  description: string;
  url: string;
  icon: JSX.Element;
}

// --- LINKS PAGE COMPONENT ---
// Main page component that renders the navbar and links section.
const LinksPage = () => {
  const [theme, setTheme] = useTheme();

  const links: LinkItem[] = [
    {
      title: "Meshtastic.org",
      description:
        "The official website and home base for the Meshtastic project.",
      url: "https://meshtastic.org/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 21h20L12 2zm0 14h.01M12 11V8" />
        </svg>
      ),
    },
    {
      title: "Meshtastic Firmware",
      description:
        "Find the latest source code and releases for the firmware on GitHub.",
      url: "https://github.com/meshtastic/firmware",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      ),
    },
    {
      title: "Meshtastic Docs",
      description:
        "Official documentation for setup, usage, and advanced features.",
      url: "https://docs.meshtastic.org/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      ),
    },
    {
      title: "Web Flasher",
      description: "Flash your Meshtastic device firmware directly from your browser.",
      url: "https://github.com/meshtastic/web-flasher",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3l-2 2h-3.5L10 22l-2-2H5z" />
          <path d="M12 11V6M12 18v-4" />
        </svg>
      ),
    },
    {
      title: "Awesome Meshtastic",
      description:
        "A curated list of awesome things related to the Meshtastic project.",
      url: "https://github.com/ShakataGaNai/awesome-meshtastic/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-indigo-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 10l4.5 4.5M15 10l-4.5 4.5M15 10l-4.5-4.5M15 10l4.5-4.5" />
          <path d="M21 12H3" />
          <path d="M21 12l-4.5 4.5" />
          <path d="M21 12l-4.5-4.5" />
          <path d="M3 12l4.5 4.5" />
          <path d="M3 12l4.5-4.5" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-400 dark:from-gray-900 dark:to-gray-950 px-6 py-24 sm:py-32 transition-all duration-300">
        <div className="max-w-4xl w-full">
          {/* Main Content */}
          <header className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-white mb-4 drop-shadow-lg">
              LA Mesh Links
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              A curated collection of resources for the Louisiana Mesh community.
            </p>
          </header>

          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border-b-4 border-indigo-500 hover:border-indigo-400"
              >
                <div className="mb-4 text-indigo-500 transition-transform duration-300 group-hover:scale-110">
                  {link.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  {link.title}
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LinksPage;