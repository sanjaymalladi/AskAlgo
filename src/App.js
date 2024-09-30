import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Send, Brain, Trash2, LogOut } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut } from 'firebase/auth';
import firebaseConfig from './auth.json';

// Initialize Firebase with the config from auth.json
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('https://askalgo-backend.onrender.com/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ question: input }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        }, 1000); // Simulate AI thinking time
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const clearChat = () => {
    setMessages([]);
  };

  const handleSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      // Send idToken to your backend for verification
      const response = await fetch('https://askalgo-backend.onrender.com/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!response.ok) {
        throw new Error('Failed to authenticate with the backend');
      }
      console.log("User signed in:", result.user);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMessages([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'}`}>
        <h1 className="text-4xl font-bold mb-8">Welcome to AI Teaching Assistant</h1>
        <div className="space-y-4">
          <button 
            onClick={() => handleSignIn(new GoogleAuthProvider())}
            className="bg-white text-gray-800 font-bold py-2 px-4 rounded-full shadow hover:bg-gray-100 transition duration-300 w-full"
          >
            Sign in with Google
          </button>
          <button 
            onClick={() => handleSignIn(new GithubAuthProvider())}
            className="bg-gray-800 text-white font-bold py-2 px-4 rounded-full shadow hover:bg-gray-700 transition duration-300 w-full"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'} transition-all duration-500`}>
      <header className={`p-4 flex justify-between items-center ${darkMode ? 'bg-opacity-30' : 'bg-white bg-opacity-70'} backdrop-blur-md`}>
        <div className="flex items-center space-x-2">
          <Brain className={darkMode ? "text-yellow-400" : "text-indigo-600"} size={32} />
          <h1 className="text-2xl font-bold">AI Teaching Assistant</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={clearChat} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'} transition-all duration-300`}>
            <Trash2 size={24} className={darkMode ? "text-red-400" : "text-red-600"} />
          </button>
          <button onClick={toggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'} transition-all duration-300`}>
            {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-indigo-600" />}
          </button>
          <button onClick={handleSignOut} className={`p-2 rounded-full ${darkMode ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'} transition-all duration-300`}>
            <LogOut size={24} className={darkMode ? "text-red-400" : "text-red-600"} />
          </button>
        </div>
      </header>
      <div className="flex-grow overflow-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg shadow-lg animate-fade-in ${
              msg.role === 'user' 
                ? (darkMode ? 'bg-blue-600 text-white' : 'bg-indigo-500 text-white') 
                : (darkMode ? 'bg-white text-gray-900' : 'bg-white text-gray-800')
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-lg shadow-lg animate-pulse ${
              darkMode ? 'bg-white text-gray-900' : 'bg-indigo-100 text-gray-800'
            }`}>
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={`p-4 ${darkMode ? 'bg-opacity-30' : 'bg-white bg-opacity-70'} backdrop-blur-md`}>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Data Structures and Algorithms..."
            className={`flex-grow p-3 rounded-lg border-2 border-transparent ${
              darkMode 
                ? 'bg-white bg-opacity-20 focus:border-blue-400 placeholder-gray-300 text-white' 
                : 'bg-white focus:border-indigo-400 placeholder-gray-400 text-gray-800'
            } focus:outline-none`}
          />
          <button type="submit" className={`p-3 rounded-lg transition-colors duration-300 ${
            darkMode 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}>
            <Send size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default App;
