"use client";

import React, { useState, useEffect } from "react";
// Replaced next/image and next/link with standard HTML elements for compatibility
// import Image from "next/image";
// import Link from "next/link";

type Theme = "light" | "dark";

// Custom theme hook
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

// Nav links (used for both desktop and mobile)
const navLinks = [
  { label: "Home", href: "#home" }, // Changed Link href to anchor ID
  { label: "Links", href: "/links" },
  { label: "Mesh Map", href: "/meshmap" },
  { label: "Discord", href: "https://discord.louisianamesh.org", external: true },
  { label: "GitHub", href: "https://github.com/LouisianaMeshCommunity", external: true },
];

const App = () => {
  const [theme, setTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [navBg, setNavBg] = useState("bg-transparent");

  // Handle scroll event to change the navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavBg("bg-gray-900");
      } else {
        setNavBg("bg-transparent");
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  // Helper component to render an icon using a standard <img> tag
  const Icon = ({ src, alt, className }: { src: string, alt: string, className: string }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      // Added width and height for proper rendering
      width={24} 
      height={24}
      loading="lazy"
      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/24x24/101827/ffffff?text=Icon'; }}
    />
  );


  // Helper component to handle both external links (<a>) and internal scrolls (<a> with #id)
  // FIX: Added optional className prop to fix TypeScript error
  const NavItem = ({ label, href, external, className }: typeof navLinks[number] & { className?: string }) => {
    const baseClasses = `hover:text-indigo-300 transition cursor-pointer ${className || ''}`;
    const handleClick = () => {
      if (href.startsWith('#')) {
        // Optional: Smooth scroll for internal links
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
      setNavOpen(false);
    };

    if (external) {
      return (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
        >
          {label}
        </a>
      );
    }
    
    // Use standard <a> for internal links/scrolls
    return (
      <a
        key={label}
        href={href}
        className={baseClasses}
        onClick={handleClick}
      >
        {label}
      </a>
    );
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-30 transition-colors duration-300 ${navBg} backdrop-blur-sm`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <a
            href="#home"
            className="text-xl font-bold text-white drop-shadow dark:text-gray-100"
            onClick={() => document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' })}
          >
            LA Mesh
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center text-white dark:text-gray-100 font-medium">
            {navLinks.map((link) => (
              <NavItem key={link.label} {...link} />
            ))}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="ml-4 p-2 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 text-white shadow transition-transform duration-300 hover:scale-110"
            >
              {theme === "dark" ? (
                <Icon
                  className="h-5 w-5"
                  src="https://www.svgrepo.com/show/508131/moon.svg"
                  alt="Moon"
                />
              ) : (
                <Icon
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
            {navLinks.map((link) => (
              <NavItem key={link.label} {...link} className="block" /> // Fixed error by allowing className prop
            ))}

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
              <Icon
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
              Meshtastic.org
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
            expanding the state&apos;s mesh networks.
            <br />
            <br />
            Whether you&apos;re new to the world of mesh communication or an
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

      <section
        id="meshcore"
        className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6"
      >
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What is Meshcore?
          </h2>
          <p className="text-lg leading-relaxed">
            Meshcore is similar to Meshtastic, but with a focus on message reliability. It uses dedicated repeater nodes with a much more sophisticated pathing solution, allowing for more reliable message sending and receiving. This allows repeater hops to reach up to 64, compared to Meshtastic&apos;s 7 hops, where anything higher causes unreliable messages.
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6"
      >
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Contact</h2>
          <p className="text-lg leading-relaxed">
            If you&apos;d like to get in touch with us, Please email us at{" "}
            <a
              href="mailto:contact@louisianamesh.org"
              className="hover:text-indigo-300 transition"
            >
              contact@louisianamesh.org
            </a>
            .
          </p>
        </div>
      </section>  

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 dark:text-gray-300">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

          {/* 1. Left: Social Icons (Centered on all screen sizes) */}
          <div className="order-2 md:order-none flex justify-center md:justify-center">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <a
                href="https://github.com/LouisianaMeshCommunity/Website"
                className="hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <Icon
                  className="h-6 w-6 invert"
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  alt="GitHub Logo"
                />
              </a>
              <a
                href="https://discord.louisianamesh.org"
                className="hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join our Discord"
              >
                <Icon
                  className="h-6 w-6 invert"
                  src="https://www.svgrepo.com/show/473585/discord.svg"
                  alt="Discord Logo"
                />
              </a>

              <a
                href="https://ko-fi.com/louisianameshcommunity"
                className="hover:text-white transition"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Support us on Ko-fi"
              >
                <Icon
                  className="h-6 w-6 invert"
                  src="https://www.svgrepo.com/show/330802/kofi.svg"
                  alt="Ko-fi Logo"
                />
              </a>
            </div>
          </div>

          {/* 2. Center: Copyright (Centered on all screen sizes) */}
          <div className="order-1 md:order-none text-center">
            <span className="text-sm">
              &copy; {new Date().getFullYear()} Louisiana Mesh Community
            </span>
          </div>

          {/* 3. Right: Partners Thank You (Centered on all screen sizes) */}
          <div className="order-3 md:order-none text-center md:text-center text-sm">
            <p className="font-semibold text-white mb-1">
              Thank You to Our Partners
            </p>
            {/* Heltec Logo Embed */}
            <a 
              href="https://heltec.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block hover:opacity-80 transition"
              aria-label="Visit Heltec Automation Website"
            >
                <img
                  src="https://heltec.org/wp-content/uploads/2021/05/heltec-logo.png"
                  alt="Heltec Automation Logo - Partner"
                  className="h-10 w-auto mx-auto" // Set height, maintain aspect ratio, center image
                  width={150} 
                  height={40}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='https://placehold.co/150x40/FFFFFF/000000?text=Heltec.org'; }}
                />
            </a>
          </div>

        </div>
      </footer>
    </>
  );
};

export default App;