// src/components/MainApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Send, Brain, Trash2, LogOut } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import firebaseConfig from '../auth.json'; // Ensure databaseURL is included
import firebase from 'firebase/app';
import 'firebase/database';

// Initialize Firebase Realtime Database
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const MainApp = ({ user, toggleDarkMode, isDarkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setMessages([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Optionally, clear chat from Firebase
  };

  const verifyToken = async () => {
    const idToken = await user.getIdToken();
    return idToken;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const idToken = await verifyToken();
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

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'} transition-all duration-500`}>
      <header className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-opacity-30' : 'bg-white bg-opacity-70'} backdrop-blur-md`}>
        <div className="flex items-center space-x-2">
          <Brain className={isDarkMode ? "text-yellow-400" : "text-indigo-600"} size={32} />
          <h1 className="text-2xl font-bold">AI Teaching Assistant</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={clearChat} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'} transition-all duration-300`}>
            <Trash2 size={24} className={isDarkMode ? "text-red-400" : "text-red-600"} />
          </button>
          <button onClick={toggleDarkMode} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'} transition-all duration-300`}>
            {isDarkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-indigo-600" />}
          </button>
          <button onClick={handleSignOut} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-200'} transition-all duration-300`}>
            <LogOut size={24} className={isDarkMode ? "text-red-400" : "text-red-600"} />
          </button>
        </div>
      </header>
      <div className="flex-grow overflow-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg shadow-lg ${
              msg.role === 'user' 
                ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-indigo-500 text-white') 
                : (isDarkMode ? 'bg-white text-gray-900' : 'bg-white text-gray-800')
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-lg shadow-lg animate-pulse ${
              isDarkMode ? 'bg-white bg-opacity-20 text-gray-300' : 'bg-indigo-100 text-gray-800'
            }`}>
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={`p-4 ${isDarkMode ? 'bg-opacity-30' : 'bg-white bg-opacity-70'} backdrop-blur-md`}>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Data Structures and Algorithms..."
            className={`flex-grow p-3 rounded-lg border-2 border-transparent ${
              isDarkMode 
                ? 'bg-white bg-opacity-20 focus:border-blue-400 placeholder-gray-300 text-white' 
                : 'bg-white focus:border-indigo-400 placeholder-gray-400 text-gray-800'
            } focus:outline-none`}
          />
          <button type="submit" className={`p-3 rounded-lg transition-colors duration-300 ${
            isDarkMode 
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

export default MainApp;
