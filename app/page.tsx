import React from 'react';

// The main component for the page.
const App: React.FC = () => {
  return (
    // Outer container for the background image and content
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed" 
      style={{ backgroundImage: "url('https://placehold.co/1920x1080')" }}
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content container, positioned on top of the overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <h1 className="text-4xl sm:text-5xl font-bold font-italic text-white text-center mb-8">Louisiana Mesh Community</h1>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Discord Button */}
          <a 
            href="https://discord.louisianamesh.org" 
            className="flex items-center justify-center space-x-2 bg-indigo-500 text-white font-italic py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span>Join Our Discord</span>
            <img className="h-5 w-5" src="https://www.svgrepo.com/show/327349/logo-discord.svg" alt="Discord Logo" />
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
  );
};

export default App;
