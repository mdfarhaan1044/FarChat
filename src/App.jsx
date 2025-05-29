import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
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
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white/90 mb-2 animate-pulse">Loading Chats</h2>
        <p className="text-white/60">Please wait a moment...</p>
      </div>
    </div>
  );

  return (

    <Router>
      <div className="w-full h-full no-scrollbar overflow-hidden">
        <Routes>
          {/* Protected App Route */}
          <Route
            path="/"
            element={
              currentUser ? (
                <div className="flex flex-col md:flex-row w-full h-full">
                  {/* Show only List if chat is not selected on small screens */}
                  {(!chatId || window.innerWidth >= 768) && <List />}

                  {/* Show Chat only if selected */}
                  {chatId && (
                    <div className={`w-full ${window.innerWidth < 768 ? 'block' : 'flex-1'}`}>
                      <Chat />
                    </div>
                  )}
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              !currentUser ? <Login /> : <Navigate to="/" />
            }
          />
          <Route
            path="/register"
            element={
              !currentUser ? <Register /> : <Navigate to="/" />
            }
          />
        </Routes>
        <Notification />
      </div>
    </Router>
  );
};

export default App;
