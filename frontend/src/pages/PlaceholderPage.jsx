import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white space-y-6">
      <div className="glass-card p-10 rounded-2xl flex flex-col items-center max-w-lg text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          {title}
        </h1>
        <p className="text-gray-400">
          This section is currently under development. Data metrics and global analytics for this module will be available shortly.
        </p>
        <Link 
          to="/"
          className="mt-6 flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
