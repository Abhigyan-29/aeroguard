import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GlobalAnalysis from "./pages/GlobalAnalysis";
import Resources from "./pages/Resources";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/global-analysis" element={<GlobalAnalysis />} />
            <Route path="/resources" element={<Resources />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;