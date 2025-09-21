import React, { useState } from 'react';

// This is a single-file application, so all components are defined here.
// In a real Gatsby site, these would be separate files.

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navItemClass = "p-2 px-4 rounded-full transition-colors duration-200 hover:bg-white/10";

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  }; 

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tight">Gatsby Placeholder</div>
          <div className="flex space-x-4">
            <a href="#" onClick={() => setCurrentPage('home')} className={navItemClass}>Home</a>
            <a href="#" onClick={() => setCurrentPage('about')} className={navItemClass}>About</a>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto p-8 flex flex-col items-center justify-center">
        {renderPage()}
      </main>

      <footer className="bg-gray-800 p-4 text-center text-sm text-gray-500 rounded-t-lg mt-8">
        &copy; {new Date().getFullYear()} Gatsby Placeholder. All rights reserved.
      </footer>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="w-full max-w-4xl text-center">
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-[1.01]">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight text-white">
          Lousiana Mesh Communitiy, coming soon <span role="img" aria-label="heart">❤️</span>
        </h1>
      </div>
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="w-full max-w-3xl text-center">
      <div className="p-8 bg-gray-800 rounded-2xl shadow-xl mt-8 transition-transform duration-300 hover:scale-[1.01]">
        <h2 className="text-4xl font-bold mb-4">About This Site</h2>
        <p className="text-lg text-gray-300 leading-relaxed mb-4">
          This small project serves as a conceptual starting point for a static site generator. While a true Gatsby site uses a build process and a file-system based routing, this application provides a similar feel by managing "pages" with React state.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          The goal is to provide a clean, responsive, and easy-to-read codebase that you can use as a foundation for your next creative project. Feel free to modify the components, add new pages, and introduce more complex functionality.
        </p>
      </div>
    </div>
  );
};

export default App;
