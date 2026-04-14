import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Globe, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { user, logout, isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const getLinkClass = (path) => {
    const base = "transition-colors py-1 ";
    return location.pathname === path 
      ? base + "text-white font-semibold border-b-2 border-blue-500" 
      : base + "text-gray-400 hover:text-white";
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      alert("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 overflow-x-hidden flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Background Ambience Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-0 left-1/4 w-[1000px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
         <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-cyan-900/10 rounded-full blur-[150px] mix-blend-screen opacity-30" />
      </div>

      {/* 🚀 GLOBAL PREMIUM NAVBAR */}
      <nav className="relative z-[2000] sticky top-0 px-6 py-4 flex justify-between items-center border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl shadow-2xl">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Globe size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AeroGuard</h1>
            <p className="text-[10px] text-indigo-400 font-bold tracking-[0.2em] uppercase">Global Anomaly Detector</p>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
          <Link to="/" className={getLinkClass("/")}>Dashboard</Link>
          <Link to="/global-analysis" className={getLinkClass("/global-analysis")}>Global Analysis</Link>
          <Link to="/resources" className={getLinkClass("/resources")}>Resources</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs text-zinc-500">{user.email}</span>
              <button onClick={logout} className="px-4 py-2 bg-gray-800 hover:bg-red-500/20 text-white rounded-full text-xs font-bold transition-all border border-white/5">
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              <UserIcon size={14} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-grow z-10">
        <Outlet />
      </div>

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#09090b] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl shadow-blue-500/10">
            <button onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-2">{isLoginMode ? "Access Network" : "Initialize Agent Profile"}</h3>
            <p className="text-sm text-gray-500 mb-6">Authenticate to access personalized watchlists and alert telemetry.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Secure Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#111113] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="agent@terrapulse.io" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Access Token</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#111113] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" 
                  placeholder="••••••••" 
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold mt-4 shadow-lg shadow-blue-600/20 transition-all">
                {isLoginMode ? "Connect to Server" : "Create Authorization"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {isLoginMode ? "Wait, I need system clearance (Register)" : "I already have clearance (Log in)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
