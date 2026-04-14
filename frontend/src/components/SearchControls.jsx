import React from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

const COUNTRIES = [
  { name: 'Global View', coords: [20, 0], zoom: 2 },
  { name: 'United States', coords: [37.0902, -95.7129], zoom: 4 },
  { name: 'Australia', coords: [-25.2744, 133.7751], zoom: 4 },
  { name: 'Canada', coords: [56.1304, -106.3468], zoom: 4 },
  { name: 'Brazil', coords: [-14.235, -51.9253], zoom: 4 },
  { name: 'India', coords: [20.5937, 78.9629], zoom: 5 },
  { name: 'Europe', coords: [54.526, 15.2551], zoom: 4 },
  { name: 'Africa', coords: [8.7832, 34.5085], zoom: 4 },
];

const SearchControls = ({ searchTerm, setSearchTerm, selectedCountry, setSelectedCountry, onCountryChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search disasters (e.g. Fire in California)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 transition-all font-medium"
        />
      </div>

      <div className="flex gap-4">
        <div className="relative min-w-[200px]">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-gray-800/50 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white appearance-none cursor-pointer font-medium"
          >
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name} className="bg-gray-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <Filter size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { SearchControls, COUNTRIES };
