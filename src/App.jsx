import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import './App.css';
import Auth from './Auth';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const messagesEndRef = useRef(null);

  // Apply theme class to the body element
  useEffect(() => {
    document.body.className = theme + '-theme'; // Apply 'light-theme' or 'dark-theme' class to body
    localStorage.setItem('theme', theme); // Save theme preference
  }, [theme]); // Re-run when theme changes

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    };
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/get_messages`, getAuthConfig());
      const loadedMessages = res.data.messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchMessages();
    } else {
      setIsLoggedIn(false);
      setMessages([]);
    }
  }, [fetchMessages, isLoggedIn]);

  // Auto-scroll to the bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const newUserMessage = { sender: "user", text: inputMessage };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage("");

    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/chat`, { message: newUserMessage.text }, getAuthConfig());
      const aiResponse = { sender: "ai", text: res.data.explanation };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.explanation || "An error occurred. Please try again.";
      setMessages((prevMessages) => [...prevMessages, { sender: "ai", text: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/clear_chat`, {}, getAuthConfig());
      alert(res.data.message);
      setMessages([]);
    } catch (error) {
      console.error("Error clearing chat:", error);
      alert("Failed to clear chat history. You might need to log in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setMessages([]);
    alert("Logged out successfully!");
  };

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  if (!isLoggedIn) {
    return <Auth setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div className="app-container">
      <h1 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Code Chat Companion ✨</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="theme-toggle-button">
            {theme === 'light' ? '🌙' : '☀️'} {/* Moon for light, Sun for dark */}
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </h1>

      <div className="chat-area">
        {loading && messages.length === 0 ? (
          <p className="empty-chat-message">Loading chat history... ⏳</p>
        ) : messages.length === 0 ? (
          <p className="empty-chat-message">
            Ready to decode? Paste your code or ask a question! 
          </p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.sender}`}>
              <span className={`message-bubble ${msg.sender}`}>
                {msg.text}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <textarea
          rows={4}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your code or question here... "
          disabled={loading}
        />
        <div className="input-buttons-container">
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="send-button"
          >
            {loading ? "Sending..." : "Send"}
          </button>
          <button
            onClick={handleClearChat}
            disabled={loading}
            className="clear-chat-button"
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
