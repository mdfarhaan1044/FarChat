import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import List from "./components/list/List";
import Detail from "./components/detail/Detail";
import Chat from "./components/chat/Chat";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import Notification from "./components/notifications/Notifications";
import ParticleBackground from "./components/ParticleBackground";

const App = () => {
  const { chatId } = useChatStore();
  const { fetchUserInfo, isLoading, currentUser } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserInfo(user.uid);
      } else {
        fetchUserInfo(null);
      }
    });
    return () => unSub();
  }, [fetchUserInfo]);

  if (isLoading) return (
    <motion.div 
      className="min-h-screen w-full animated-bg flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ParticleBackground />
      <motion.div 
        className="text-center glass rounded-3xl p-8 backdrop-blur-xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.div 
          className="w-20 h-20 border-4 border-white/20 border-t-white/60 rounded-full mx-auto mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.h2 
          className="text-3xl font-bold text-white/90 mb-2 neon-text"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading Chats
        </motion.h2>
        <motion.p 
          className="text-white/60 text-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Please wait a moment...
        </motion.p>
      </motion.div>
    </motion.div>
  );

  return (
    <Router>
      <div className="w-full h-full no-scrollbar overflow-hidden">
        <ParticleBackground />
        <AnimatePresence mode="wait">
          <Routes>
            {/* Protected App Route */}
            <Route
              path="/"
              element={
                currentUser ? (
                  <motion.div 
                    className="flex flex-col md:flex-row w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Show only List if chat is not selected on small screens */}
                    {(!chatId || window.innerWidth >= 768) && (
                      <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                      >
                        <List />
                      </motion.div>
                    )}

                    {/* Show Chat only if selected */}
                    {chatId && (
                      <motion.div 
                        className={`w-full ${window.innerWidth < 768 ? 'block' : 'flex-1'}`}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                      >
                        <Chat />
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                !currentUser ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Login />
                  </motion.div>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/register"
              element={
                !currentUser ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Register />
                  </motion.div>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </Routes>
        </AnimatePresence>
        <Notification />
      </div>
    </Router>
  );
};

export default App;
