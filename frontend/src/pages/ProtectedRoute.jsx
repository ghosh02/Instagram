// import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// const ProtectedRoutes = ({ children }) => {
//   const { user } = useSelector((store) => store.auth);
//   const navigate = useNavigate();
//   useEffect(() => {
//     if (!user) {
//       navigate("/login");
//     }
//   }, []);
//   return <>{children}</>;
// };

// export default ProtectedRoutes;

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (
      (user && location.pathname === "/login") ||
      (user && location.pathname === "/signup")
    ) {
      navigate("/");
    }
  }, [user, navigate, location.pathname]);

  return <>{children}</>;
};

export default ProtectedRoutes;
