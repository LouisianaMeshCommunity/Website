"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // Added next/image import

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
  { label: "Home", href: "#home" },
  { label: "Docs", href: "https://docs.gulfcoastmesh.org" },
  { label: "Mesh Map's", href: "/meshmap" },
  { label: "Discord", href: "https://discord.gulfcoastmesh.org", external: true },
  { label: "GitHub", href: "https://github.com/LouisianaMeshCommunity", external: true },
];

const App = () => {
  const [theme, setTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [navBg, setNavBg] = useState("bg-transparent");
  const [showBanner, setShowBanner] = useState(true);

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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Updated Icon component using next/image
  const Icon = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <Image
      src={src}
      alt={alt}
      width={24}
      height={24}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );

  const NavItem = ({ label, href, external, className }: typeof navLinks[number] & { className?: string }) => {
    const baseClasses = `hover:text-indigo-300 transition cursor-pointer ${className || ''}`;
    const handleClick = () => {
      if (href.startsWith('#')) {
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
      {/* Announcement Banner */}
      {showBanner && (
        <div className="fixed top-0 left-0 w-full z-50 bg-indigo-600 text-white px-4 py-2 text-center text-sm sm:text-base font-medium shadow-md flex items-center justify-center gap-2">
          <span className="flex items-center gap-2">
            <span role="img" aria-label="loudspeaker"></span> 
            New Meshcore settings! Please{""}
            <a 
              href="https://docs.gulfcoastmesh.org/freq-settings/" 
              className="underline font-bold hover:text-indigo-100 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              read our docs
            </a>{" "}
            to ensure your repeater works correctly.
          </span>
          <button 
            onClick={() => setShowBanner(false)}
            className="ml-4 p-1 hover:bg-white/20 rounded-full transition shrink-0"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Navbar - Adjusted top offset based on banner visibility */}
      <nav
        className={`fixed ${showBanner ? 'top-10 sm:top-10' : 'top-0'} left-0 w-full z-40 transition-all duration-300 ${navBg} backdrop-blur-sm`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <a
            href="#home"
            className="text-xl font-bold text-white drop-shadow dark:text-gray-100"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#home')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Gulf Mesh
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
              className="ml-4 p-2 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-700/50 text-white shadow transition-transform duration-300 hover:scale-110 flex items-center justify-center"
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
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {navOpen && (
          <div className="md:hidden bg-black/70 text-white px-4 py-3 space-y-2 backdrop-blur-sm">
            {navLinks.map((link) => (
              <NavItem key={link.label} {...link} className="block" />
            ))}

            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setNavOpen(false);
              }}
              className="mt-3 p-2 rounded-lg bg-white/20 hover:bg-white/30 w-full text-left"
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
            Gulf Coast Mesh
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://discord.gulfcoastmesh.org"
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
              href="https://docs.gulfcoastmesh.org/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:scale-105 hover:shadow-xl transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Our Docs
            </a>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <section id="about" className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What is the Gulf Coast Mesh?</h2>
          <p className="text-lg leading-relaxed">
            The Gulf Coast Mesh is a growing group of individuals dedicated to interconnecting Louisiana&apos;s cities and other's along the Gulf Coast with a decentralized, open-source messaging system. Providing a resilient communication channel that helps families stay together and communicate with others even when infrastructure is damaged from natural disasters.
          </p>
        </div>
      </section>

      <section id="meshcore" className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What is Meshcore?</h2>
          <p className="text-lg leading-relaxed">
            Meshcore is similar to Meshtastic, but with a focus on message reliability. It uses dedicated repeater nodes with a much more sophisticated pathing solution, allowing for more reliable message sending and receiving. This allows repeater hops to reach up to 64, compared to Meshtastic&apos;s 7 hops, where anything higher causes unreliable messages.
          </p>
        </div>
      </section>

      <section id="meshtastic" className="bg-gradient-to-br from-orange-100 to-amber-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What is Meshtastic?</h2>
          <p className="text-lg leading-relaxed">
            Meshtastic is a decentralized, open-source communication protocol that establishes a mesh network using low-power, long-range LoRa technology. It allows devices to send and receive text messages without relying on the internet, cellular networks, or any centralized infrastructure.
          </p>
        </div>
      </section>

      <section id="contact" className="bg-gradient-to-br from-green-100 to-green-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Contact</h2>
          <p className="text-lg leading-relaxed">
            If you&apos;d like to get in touch with us, Please email us at{" "}
            <a href="mailto:contact@louisianamesh.org" className="hover:text-indigo-300 transition underline underline-offset-4">
              contact@louisianamesh.org
            </a>.
          </p>
        </div>
      </section>

      <section id="Sign up for our newsletter" className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-100 py-20 px-6">
        <div className="max-w-4xl mx-auto bg-white/70 dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <a href="https://gulfcoastmesh.org/emailsignup" className="hover:text-indigo-300 transition underline underline-offset-4">
              Sign up for our newsletter
            </a>
          </h2>
          <p className="text-lg leading-relaxed">
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400 dark:text-gray-300">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="order-2 md:order-none text-center md:text-left text-sm flex flex-col items-center md:items-start">
            <p className="font-semibold text-white mb-3">Thank You to Our Supporters</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {["ma7", "n5msy", "talwah", "simon", "kyra", "terry", "mike", "rg3120", "Mike Baldwin"].map(name => (
                <span key={name} className="px-3 py-1 bg-gray-800/80 text-indigo-300 rounded-full text-xs font-semibold tracking-wide border border-gray-700 shadow-sm hover:bg-gray-700 transition cursor-default">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-none flex flex-col items-center gap-3 text-center">
            <span className="text-sm">&copy; {new Date().getFullYear()} Louisiana Mesh Community</span>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <a href="https://github.com/LouisianaMeshCommunity/Website" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="GitHub">
                <Icon className="h-6 w-6 invert" src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" />
              </a>
              <a href="https://discord.gulfcoastmesh.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Discord">
                <Icon className="h-6 w-6 invert" src="https://www.svgrepo.com/show/473585/discord.svg" alt="Discord" />
              </a>
              <a href="https://ko-fi.com/louisianameshcommunity" target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Ko-fi">
                <Icon className="h-6 w-6 invert" src="https://www.svgrepo.com/show/330802/kofi.svg" alt="Ko-fi" />
              </a>
            </div>
          </div>

          <div className="order-3 md:order-none text-center text-sm">
            <p className="font-semibold text-white mb-2">Thank You to Our Partners</p>
            <a href="https://heltec.org/" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition" aria-label="Heltec Automation">
              {/* Updated Partner Logo using next/image */}
              <Image 
                src="https://heltec.org/wp-content/uploads/2021/05/heltec-logo.png" 
                alt="Heltec Partner" 
                width={140} 
                height={40} 
                className="h-10 w-auto mx-auto" 
                style={{ objectFit: 'contain' }} 
              />
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default App;