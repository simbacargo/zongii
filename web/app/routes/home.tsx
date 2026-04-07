import React, { useEffect } from "react";
import Dashboard from "../dashboard/Dashboard";
import { useNavigate } from "react-router";
import { useAuth } from "~/Context/AppContext";
export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
console.log('====================================');
console.log(isAuthenticated);
console.log('====================================');
  useEffect(() => {
    if (!isAuthenticated) navigate("/login", { replace: true });
  }, [isAuthenticated, navigate]);

  return <Dashboard />;
}
