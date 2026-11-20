
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { supabase } from "./lib/supabase";

// Test Supabase connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("Supabase connection failed:", error.message);
  } else {
    console.log("VOXAM Supabase connected successfully!");
    console.log("Current session:", data.session);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
