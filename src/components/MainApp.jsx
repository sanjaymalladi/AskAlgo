import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Send, Brain, Trash2, LogOut, MessageSquare, Plus } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { ref, onValue, push, set } from 'firebase/database';
import { auth, db } from '../firebase';

const MainApp = ({ user, toggleDarkMode, isDarkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState({});
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      const conversationsRef = ref(db, `users/${user.uid}/conversations`);
      const unsubscribe = onValue(conversationsRef, (snapshot) => {
        if (snapshot.exists()) {
          setConversations(snapshot.val());
        } else {
          setConversations({});
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setMessages([]);
      setConversations({});
      setCurrentConversationId(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
  };

  const createNewChat = () => {
    clearChat();
    setCurrentConversationId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      console.log('Sending request to backend...');
      const response = await fetch('https://askalgo-backend.onrender.com/ask', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          question: input,
          conversationId: currentConversationId
        }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      setIsTyping(false);
      const aiMessage = { role: 'ai', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
      
      // Update or create conversation in Firebase
      const conversationRef = currentConversationId 
        ? ref(db, `users/${user.uid}/conversations/${currentConversationId}`)
        : push(ref(db, `users/${user.uid}/conversations`));
      
      set(conversationRef, {
        messages: [...messages, userMessage, aiMessage],
        timestamp: Date.now()
      });

      setCurrentConversationId(currentConversationId || conversationRef.key);
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setError(`Failed to get AI response: ${error.message}`);
    }
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations[conversationId];
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(conversationId);
      setError(null);
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
      <div className="flex flex-grow overflow-hidden">
        <div className={`w-64 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          <button
            onClick={createNewChat}
            className={`w-full text-left p-2 rounded mb-2 ${
              isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            <Plus size={18} className="inline mr-2" />
            New Chat
          </button>
          {Object.entries(conversations).sort((a, b) => b[1].timestamp - a[1].timestamp).map(([id, conversation]) => (
            <button
              key={id}
              onClick={() => loadConversation(id)}
              className={`w-full text-left p-2 rounded mb-2 ${
                currentConversationId === id
                  ? (isDarkMode ? 'bg-blue-600' : 'bg-indigo-500 text-white')
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
              }`}
            >
              <MessageSquare size={18} className="inline mr-2" />
              {conversation.messages[0].content.substring(0, 20)}...
            </button>
          ))}
        </div>
        <div className="flex-grow flex flex-col overflow-hidden">
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
            {error && (
              <div className="flex justify-center">
                <div className={`p-3 rounded-lg shadow-lg ${
                  isDarkMode ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'
                }`}>
                  {error}
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
      </div>
    </div>
  );
};

export default MainApp;
