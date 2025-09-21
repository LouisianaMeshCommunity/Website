"use client";

import React, { useState, useEffect } from "react";

// Custom theme hook
const useTheme = () => {
  const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedTheme = window.localStorage.getItem("theme");
      return (
        storedTheme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light")
      );
    }
    return "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const rawSetTheme = (newTheme: string) => {
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

const App: React.FC = () => {
  const [theme, setTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-transparent backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <a
            href="#home"
            className="text-xl font-bold text-white drop-shadow dark:text-gray-100"
          >
            LA Mesh
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center text-white dark:text-gray-100 font-medium">
            
            <a
              href="https://louisianamesh.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition"
            >
              Home
            </a>

            <a
              href="https://discord.louisianamesh.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-300 transition"
            >
              Discord
            </a>
            <a
              href="https://github.com/LouisianaMeshCommunity"
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
                <img
                  className="h-5 w-5"
                  src="https://www.svgrepo.com/show/508131/moon.svg"
                  alt="Moon"
                />
              ) : (
                <img
                  className="h-5 w-5"
                  src="https://www.svgrepo.com/show/535669/sun.svg"
                  alt="Sun"
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
            <a href="#home" onClick={() => setNavOpen(false)}>Home</a>
            <a href="#about" onClick={() => setNavOpen(false)}>About</a>
            <a href="#meshtastic" onClick={() => setNavOpen(false)}>Meshtastic</a>
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

      {/* Hero Section */}
      <div
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center px-4 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url("/files/images/banner.jpg")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/30 backdrop-blur-sm"></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full text-center mt-20">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg mb-8">
            Louisiana Mesh Community
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://discord.louisianamesh.org"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-400 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:scale-105 hover:shadow-xl transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Our Discord
              <img
                className="h-5 w-5 invert"
                src="https://www.svgrepo.com/show/506463/discord.svg"
                alt="Discord Logo"
              />
            </a>

            <a
              href="https://meshtastic.org/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:scale-105 hover:shadow-xl transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meshtastic.org <span className="font-mono">//\</span>
            </a>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <section
        id="about"
        className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6"
      >
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What is Louisiana Mesh?
          </h2>
          <p className="text-lg leading-relaxed">
            The Louisiana Mesh Community is a growing group of individuals who
            share a common interest in Meshtastic, Meshcore, and other types of
            mesh radio networks.
            <br />
            <br />
            We are based in Louisiana and share a love for exploring and
            expanding the state's mesh networks.
            <br />
            <br />
            Whether you're new to the world of mesh communication or an
            experienced user, everyone is welcome to join and contribute to the
            community.
          </p>
        </div>
      </section>

      <section
        id="meshtastic"
        className="bg-gradient-to-br from-orange-100 to-amber-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6"
      >
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What is Meshtastic?
          </h2>
          <p className="text-lg leading-relaxed">
            Meshtastic is a decentralized, open-source communication protocol
            that establishes a mesh network using low-power, long-range LoRa
            technology. It allows devices to send and receive text messages
            without relying on the internet, cellular networks, or any
            centralized infrastructure.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-3 py-6 bg-gray-900 text-gray-400 dark:text-gray-300">
        <span className="text-sm">
          &copy; {new Date().getFullYear()} Louisiana Mesh Community
        </span>
        <a
          href="https://github.com/LouisianaMeshCommunity/Website"
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="h-6 w-6 invert"
            src="https://www.svgrepo.com/show/512317/github-142.svg"
            alt="GitHub Logo"
          />
        </a>
      </footer>
    </>
  );
};

export default App;
