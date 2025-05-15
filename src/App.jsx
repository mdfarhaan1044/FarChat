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

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* Protected App Route */}
          <Route
            path="/"
            element={
              currentUser ? (
                <>
                  <List />
                  {chatId && <Chat />}
                </>
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
