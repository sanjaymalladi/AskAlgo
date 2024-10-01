// src/App.jsx
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthComponent from './components/AuthComponent';
import MainApp from './components/MainApp';
import firebaseConfig from './auth.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} transition-colors duration-500`}>
        {user ? (
          <MainApp user={user} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        ) : (
          <AuthComponent toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
};

export default App;
