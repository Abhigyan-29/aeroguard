import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEvents, getNews, toggleWatchlist } from "../services/api";
import { useAuth } from "../context/AuthContext";
import MapView from "../components/MapView";
import EventStats from "../components/EventStats";
import { SearchControls, COUNTRIES } from "../components/SearchControls";
import { Globe, Shield, Zap, Info, ExternalLink, Download, MapPin, Newspaper, Bookmark, BookmarkCheck } from "lucide-react";

const Home = () => {
  const { user, setIsAuthModalOpen, updateUserWatchlist } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [searchFilteredEvents, setSearchFilteredEvents] = useState([]);
  const [listEvents, setListEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Global View");
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [mapBounds, setMapBounds] = useState(null);
  
  const [timeframe, setTimeframe] = useState(60); // Default to 2 months
  const [isFetchingOlder, setIsFetchingOlder] = useState(false);
  
  // Geolocation states
  const [resolvedLocations, setResolvedLocations] = useState({});
  const [loadingLocations, setLoadingLocations] = useState({});
  
  // News and Watchlist states
  const [activeNewsEvent, setActiveNewsEvent] = useState(null);
  const [newsCache, setNewsCache] = useState({});

  const handleWatchlist = async (e, event) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const updated = await toggleWatchlist(event);
    updateUserWatchlist(updated);
  };

  const handleNewsFetch = async (e, event) => {
    e.stopPropagation();
    if (newsCache[event.id]) {
      setActiveNewsEvent(activeNewsEvent === event.id ? null : event.id);
      return;
    }
    setActiveNewsEvent(event.id);
    const query = `${event.title} ${event.categories[0]?.title || ''}`;
    try {
      const data = await getNews(query);
      setNewsCache(prev => ({ ...prev, [event.id]: data.articles }));
    } catch {
       setNewsCache(prev => ({ ...prev, [event.id]: [] })); 
    }
  };

  const isSaved = (eventId) => user?.watchlist?.some(w => w.eventId === eventId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEvents(timeframe);
        setEvents(data.events);
        setSearchFilteredEvents(data.events);
        setListEvents(data.events);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
        setIsFetchingOlder(false);
      }
    };
    fetchData();
  }, [timeframe]);

  // Filter events by search term (affects Map & List)
  useEffect(() => {
    const filtered = events.filter((event) => {
      return event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             event.categories[0]?.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setSearchFilteredEvents(filtered);
  }, [searchTerm, events]);

  // Filter list by map bounds and sort by latest
  useEffect(() => {
    let bounded = searchFilteredEvents;
    
    // Always filter by view bounds so zooming in naturally updates the stats and list
    if (mapBounds) {
      bounded = searchFilteredEvents.filter((event) => {
         const coords = event.geometry[0]?.coordinates;
         if (coords) {
             const [lng, lat] = coords;
             return mapBounds.contains([lat, lng]);
         }
         return false;
      });
    }

    // Sort by latest date descending
    bounded = [...bounded].sort((a, b) => {
      const dateA = new Date(a.geometry[0]?.date || 0).getTime();
      const dateB = new Date(b.geometry[0]?.date || 0).getTime();
      return dateB - dateA;
    });

    setListEvents(bounded);
  }, [searchFilteredEvents, mapBounds]);

  const handleCountryChange = (countryName) => {
    const country = COUNTRIES.find(c => c.name === countryName);
    if (country) {
      setSelectedCountry(countryName);
      setMapCenter(country.coords);
      setMapZoom(country.zoom);
    }
  };

  const handleFlyToEvent = (coords) => {
    setMapCenter([coords[1], coords[0]]);
    setMapZoom(8);
    // don't set country to global view so bounds filter remains active
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe Reverse Geocoding via Nominatim
  const resolveState = async (event, e) => {
    e.stopPropagation(); // prevent flying to map
    if (resolvedLocations[event.id]) return;

    setLoadingLocations(prev => ({ ...prev, [event.id]: true }));
    
    try {
      const coords = event.geometry[0]?.coordinates;
      if (!coords || coords.length < 2) throw new Error("No coordinates");
      const [lng, lat] = coords;
      
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      
      const state = data.address?.state || data.address?.region || data.address?.county || "Remote Area";
      const country = data.address?.country || "International Space";
      
      setResolvedLocations(prev => ({ ...prev, [event.id]: `${state}, ${country}`}));
    } catch (err) {
      console.error(err);
      setResolvedLocations(prev => ({ ...prev, [event.id]: "Location unavailable" }));
    } finally {
      setLoadingLocations(prev => ({ ...prev, [event.id]: false }));
    }
  };

  const handleExportCSV = () => {
    if (listEvents.length === 0) {
      alert("No active events to export in this region.");
      return;
    }

    const headers = ["Event ID", "Title", "Category", "Date", "Latitude", "Longitude", "Resolved Area (If requested)"];
    const rows = listEvents.map(event => {
      const point = event.geometry[0];
      const coords = point?.coordinates || [0, 0];
      const area = resolvedLocations[event.id] || "Not Resolved";
      return [
        event.id,
        `"${event.title.replace(/"/g, '""')}"`, // Handle commas in titles
        event.categories[0]?.title || "Unknown",
        new Date(point?.date).toISOString(),
        coords[1],
        coords[0],
        `"${area}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TerraPulse_Export_${selectedCountry.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-20 relative z-10">
      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* ✨ HERO SECTION */}
        <section className="mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <div className="flex items-center space-x-2 text-blue-500 mb-4 bg-blue-500/10 w-fit px-3 py-1.5 rounded-full border border-blue-500/20">
                <Shield size={14} className="text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">Live 48-Hour Telemetry Active</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-5 tracking-tighter">
                Planetary <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400">Intelligence.</span>
              </h2>
              <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed font-medium">
                High-fidelity, real-time monitoring of global anomalies. Viewing strict disaster updates compiled within the <strong className="text-zinc-200 font-bold">last 48 hours</strong> sourced directly from the NASA EONET feeds.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 bg-[#0a0a0d]/80 backdrop-blur-xl p-3 rounded-3xl border border-white/5 shadow-2xl">
              <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl flex items-center space-x-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <Zap size={16} className="text-blue-400" />
                <span className="text-sm font-semibold tracking-wide">Active Monitoring</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 📊 STATS (Filtered to match Map Focus Mode) */}
        <EventStats 
          events={listEvents.filter(e => {
            if (!e.geometry || e.geometry.length === 0) return false;
            const eventDate = new Date(e.geometry[0].date).getTime();
            const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
            return eventDate >= twoDaysAgo;
          })} 
        />

        {/* 🗺 MAP & CONTROLS */}
        <section className="mb-12">
          <SearchControls 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
          />
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[2.2rem] opacity-20 blur group-hover:opacity-30 transition duration-1000"></div>
            <MapView 
               events={searchFilteredEvents} 
               mapCenter={mapCenter} 
               mapZoom={mapZoom} 
               onBoundsChange={(bounds) => setMapBounds(bounds)} 
            />
          </div>
        </section>

        {/* 📋 EVENT LISTINGS */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center space-x-3">
              <Info className="text-blue-400" size={24} />
              <h3 className="text-2xl font-bold text-white">
                 {selectedCountry === "Global View" ? "Latest Detections" : `Detections in ${selectedCountry}`}
              </h3>
            </div>
            
            <div className="flex items-center space-x-4">
              <p className="text-gray-500 text-sm font-medium border border-gray-700/50 bg-gray-800/50 px-3 py-1 rounded-full">
                Showing {listEvents.length > 6 ? 6 : listEvents.length} of {listEvents.length} events
              </p>
              <button 
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                <Download size={16} />
                <span>Export Data</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 glass-card rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {listEvents.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center p-12 glass-card rounded-3xl border border-white/5">
                  <Globe size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg font-medium text-center">No active disasters detected in this region.</p>
                  <p className="text-gray-500 text-sm mt-2 text-center">Try adjusting your map view or filtering.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {listEvents.slice(0, timeframe === 60 ? 6 : 12).map((event, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={event.id}
                        onClick={() => handleFlyToEvent(event.geometry[0].coordinates)}
                        className="glass-card p-6 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink size={16} className="text-blue-400" />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {event.categories[0]?.title}
                          </div>
                          <span className="text-xs text-gray-500 font-medium tracking-tighter">
                            {new Date(event.geometry[0]?.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {event.title}
                        </h2>

                        <div className="mt-auto pt-6 flex items-center justify-between">
                          <div className="flex flex-col gap-2">
                             {resolvedLocations[event.id] ? (
                               <div className="flex items-center space-x-1 mb-2 text-xs text-green-400/90 font-semibold bg-green-500/10 px-2 py-1 rounded w-fit">
                                 <MapPin size={12} />
                                 <span>{resolvedLocations[event.id]}</span>
                               </div>
                             ) : (
                               <button 
                                 onClick={(e) => resolveState(event, e)}
                                 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 hover:text-white transition-colors flex items-center space-x-1 w-fit border border-gray-600/50 hover:border-gray-400 rounded px-2 py-1 mb-2"
                               >
                                 <MapPin size={10} />
                                 <span>{loadingLocations[event.id] ? "Locating..." : "Detect State"}</span>
                               </button>
                             )}
                          </div>
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={(e) => handleWatchlist(e, event)}
                              className={`transition-colors ${isSaved(event.id) ? 'text-emerald-400' : 'text-gray-500 hover:text-white'}`}
                              title="Save to Watchlist"
                            >
                              {isSaved(event.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                            </button>
                            <button 
                              onClick={(e) => handleNewsFetch(e, event)}
                              className={`transition-colors flex items-center space-x-1 ${activeNewsEvent === event.id ? 'text-blue-400' : 'text-gray-500 hover:text-white'}`}
                              title="Live News"
                            >
                              <Newspaper size={16} />
                            </button>
                            <button className="text-xs font-bold text-blue-400 group-hover:underline underline-offset-4 decoration-2">
                              Fly Map →
                            </button>
                          </div>
                        </div>

                        {/* Expandable News Slider */}
                        {activeNewsEvent === event.id && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             className="mt-4 pt-4 border-t border-white/10"
                           >
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center"><Newspaper size={12} className="mr-2"/> Intel Briefing</h4>
                             {!newsCache[event.id] ? (
                               <div className="flex justify-center p-4">
                                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                               </div>
                             ) : newsCache[event.id].length === 0 ? (
                               <p className="text-xs text-gray-500 italic">No direct briefings found.</p>
                             ) : (
                               <ul className="space-y-3">
                                 {newsCache[event.id].slice(0, 2).map((news, i) => (
                                   <li key={i} className="text-xs">
                                      <a href={news.url} target="_blank" rel="noreferrer" className="text-blue-300 font-semibold hover:underline block line-clamp-2">
                                        {news.title}
                                      </a>
                                      <span className="text-gray-500 font-medium block mt-1">{news.source?.name}</span>
                                   </li>
                                 ))}
                               </ul>
                             )}
                           </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Historical Data Paginator */}
              {timeframe === 60 && (
                <div className="mt-10 flex justify-center w-full">
                  <button 
                    onClick={() => {
                      setIsFetchingOlder(true);
                      setTimeframe(365); // fetch 1 year of data
                    }}
                    disabled={isFetchingOlder}
                    className="group relative px-6 py-3 bg-gray-800/80 hover:bg-gray-800 border border-gray-700/50 hover:border-blue-500/50 rounded-xl transition-all disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                    <span className="relative text-sm font-semibold text-gray-300 group-hover:text-blue-400 transition-colors flex items-center space-x-2">
                       {isFetchingOlder ? (
                         <>
                           <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                           <span>Fetching detailed historical archive...</span>
                         </>
                       ) : (
                         <span>For older disasters, click here</span>
                       )}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3 grayscale opacity-50">
            <Globe size={20} className="text-white" />
            <span className="text-sm font-bold text-white uppercase tracking-widest">AeroGuard</span>
          </div>
          <p className="text-gray-500 text-sm">
            Powered by NASA Earth Observatory Natural Event Tracker (EONET) API.
          </p>
          
          <div className="text-gray-500 text-xs">
            Made with ❤️ by <b>Abhigyan</b> 
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default Home;