import {
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MainLayout from "./pages/MainLayout";
import ProtectedRoutes from "./pages/ProtectedRoute";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ChatPage from "./pages/ChatPage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setSocket } from "../redux/socketSlice";
import { setOnlineUsers } from "../redux/chatSlice";
import { setLikeNotification } from "../redux/rtnSlice";

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <ProtectedRoutes>
        <Login />
      </ProtectedRoutes>
    ),
  },
  {
    path: "/signup",
    element: (
      <ProtectedRoutes>
        <Signup />
      </ProtectedRoutes>
    ),
  },
]);
function App() {
  const { user } = useSelector((store) => store.auth);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io("https://instagram-tk62.onrender.com", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      socketio.on("Notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });
      return () => {
        socketio.close();
        dispatch(setSocket(null));
      };
    } else {
      socket?.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
