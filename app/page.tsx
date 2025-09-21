"use client"; 

import React, { useState, useEffect } from 'react';

// A custom hook to manage the theme state and persistence.
const useTheme = () => {
  const getInitialTheme = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      return storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  const rawSetTheme = (newTheme) => {
    const root = window.document.documentElement;
    const isDark = newTheme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light'); // Fixed variable name

    window.localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    rawSetTheme(theme);
  }, [theme]);

  return [theme, setTheme];
};

// The main component for the page.
const App: React.FC = () => {
  const [theme, setTheme] = useTheme();

  return (
    // Use a React Fragment to render multiple top-level elements
    <>
      {/* Outer container for the background image and content */}
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed" 
        style={{
          backgroundImage: `url("/files/images/banner.jpg")`,
        }}
      >
        {/* Semi-transparent overlay for better text readability */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        
        {/* Theme toggle button */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full bg-white dark:bg-gray-600 text-gray-600 dark:text-white shadow-lg transition-colors duration-500 ease-in-out transform hover:scale-110"
          >
            {theme === 'dark' ? (
              // Moon icon
              <img className="h-5 w-5" src="https://www.svgrepo.com/show/508131/moon.svg" alt="Discord Logo" />
            ) : (
              // Sun icon
              <img className="h-5 w-5" src="https://www.svgrepo.com/show/535669/sun.svg" alt="Discord Logo" />
            )}
          </button>
        </div>
        
        {/* Content container, positioned on top of the overlay */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl sm:text-5xl font-bold font-italic text-white text-center mb-8">Louisiana Mesh Community</h1>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Discord Button */}
            <a 
              href="https://discord.louisianamesh.org" 
              className="flex items-center justify-center inspace-x-2 bg-indigo-500 text-white font-italic py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span>Join Our Discord&nbsp; </span>
              <img className="h-5 w-5 invert" src="https://www.svgrepo.com/show/506463/discord.svg" alt="Discord Logo" />
            </a>
    
    
            {/* Meshtastic.org Button */}
            <a 
              href="https://meshtastic.org/" 
              className="flex items-center justify-center space-x-2 bg-emerald-500 text-white font-italic py-3 px-8 rounded-lg shadow-md hover:bg-emerald-700 transition duration-300 transform hover:scale-105"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span>Meshtastic.org</span> 
              <span className="font-mono">//\</span>
            </a>
          </div>
        </div>
      </div>

      {/* New section with "What is Louisiana Mesh?" and about text */}
      <div className="bg-blue-200 dark:bg-gray-800 text-gray-800 dark:text-white py-16 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-3xl font-bold text-left mb-2">What is Louisiana Mesh?</h2>
          <p className="text-lg sm:text-xl text-left leading-relaxed">
The Louisiana Mesh Community is a growing group of individuals who share a common interest in Meshtastic, Meshcore, and other types of mesh radio networks.

We are based in Louisiana and share a love for exploring and expanding the state's mesh networks. 
<br/><br/>
Whether you're new to the world of mesh communication or an experienced user, everyone is welcome to join and contribute to the community. 
          </p>
        </div>
      </div>
      {/* New section with "What is Meshtastic?" and about text */}
      <div className="bg-orange-200 dark:bg-gray-800 text-gray-800 dark:text-white py-16 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-3xl font-bold text-left mb-2">What is Meshtastic?</h2>
          <p className="text-lg sm:text-xl text-left leading-relaxed">
Meshtastic is a decentralized, open-source communication protocol that establishes a mesh network using low-power, long-range radio LORA technology. It allows devices to send and receive text messages without relying on the internet, cellular networks, or any centralized infrastructure.
          </p>
        </div>
      </div>

{/* Footer with copyright and github link, updated for dark mode */}
      <div className="flex flex-col sm:flex-row items-center justify-end px-4 py-2 bg-gray-900 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
        <span className="text-sm font-italic mb-2 sm:mb-0 sm:mr-4 text-white">&copy; {new Date().getFullYear()} Louisiana Mesh Community</span>
        <a 
          href="https://www.svgrepo.com/show/512317/github-142.svg"
          className="flex items-center space-x-2"
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            className="h-5 w-5 filter invert" 
            src="https://www.svgrepo.com/show/512317/github-142.svg" 
            alt="GitHub Logo" 
          />
        </a>
      </div>
    </>
  );
};

export default App;