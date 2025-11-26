import React, { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";

function App() {
  const [auth, setAuth] = useState({ token: null, user: null });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        setAuth({ token, user: JSON.parse(userStr) });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  if (!auth.token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout
      user={auth.user}
      token={auth.token}
      onLogout={handleLogout}
    />
  );
}

export default App;
