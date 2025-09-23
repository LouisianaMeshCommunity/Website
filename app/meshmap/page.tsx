"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// ---------------- THEME HOOK ----------------
type Theme = "light" | "dark";

const useTheme = () => {
  const getInitialTheme = (): Theme => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme");
      return (storedTheme as Theme) || "light";
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
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
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
          <Link href="/meshmap" className="hover:text-indigo-300 transition">
            Mesh Map
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
                src="https://www.svgrepo.com/show/508131/moon.svg"
                alt="Moon"
                width={20}
                height={20}
                className="h-5 w-5"
              />
            ) : (
              <Image
                src="https://www.svgrepo.com/show/535669/sun.svg"
                alt="Sun"
                width={20}
                height={20}
                className="h-5 w-5"
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

// --- LINKS PAGE COMPONENT ---
const LinksContent = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-blue-200 dark:from-gray-900 dark:to-gray-950 px-6 py-24 sm:py-32 transition-all duration-300">
      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-white mb-4 drop-shadow-lg">
            Louisiana Mesh Community Map
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            A map powered by the LA Mesh community.
          </p>
        </header>

        {/* Links Grid */}
        <div className="grid grid-cols-1 gap-6">
          <a
            href="https://meshview.louisianamesh.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 border-b-4 border-indigo-500 hover:border-indigo-400"
          >
            {/* Left side: Title */}
            <div className="flex items-center gap-4 text-left">
              <div className="text-indigo-500 transition-transform duration-300 group-hover:scale-110"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Meshview
              </h2>
            </div>
            {/* Right side: Description */}
            <div className="flex-1 ml-6 text-right text-gray-600 dark:text-gray-400">
              The official website and home base for the Meshtastic project.
            </div>
          </a>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-gray-300 dark:border-gray-700"></div>

        {/* How-to Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How to Add Your Device to the Map via MQTT
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you&apos;re not nearby another node reporting to the map, you can have your device report itself to the map via MQTT.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Open the Meshtastic app or web client.</li>
            <li className="font-bold">Module Configuration &gt; MQTT</li>
            <ul className="list-circle list-inside ml-5">
              <li>
                MQTT Enabled:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  True
                </code>
              </li>
              <li>
                Encryption Enabled:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  True
                </code>
              </li>
              <li>
                JSON Enabled:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  False
                </code>
              </li>
              <li>
                Map Report Enabled:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  Optional
                </code>
              </li>
              <li>
                Root Topic:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  msh/US/LA
                </code>
              </li>
              <li>
                Server Address:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  mqtt.louisianamesh.org
                </code>
              </li>
              <li>
                Username:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  uplink
                </code>
              </li>
              <li>
                Password:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  uplink
                </code>
              </li>
              <li>
                TLS Enabled:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  False
                </code>
              </li>
            </ul>
            <li className="font-bold">
              Radio Configuration &gt; Channels &gt; 0 / Primary
            </li>
            <ul className="list-circle list-inside ml-5">
              <li>
                MQTT Uplink:{" "}
                <code className="font-mono bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  Enabled
                </code>
              </li>
            </ul>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  const [theme, setTheme] = useTheme();

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />
      <LinksContent />
    </>
  );
};

export default App;
