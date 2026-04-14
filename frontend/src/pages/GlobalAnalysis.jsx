import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Activity, Globe, Flame, Wind, TrendingUp } from "lucide-react";
import { getEvents } from "../services/api";

const COLORS = {
  wildfires: '#f97316',
  severeStorms: '#10b981',
  seaLakeIce: '#06b6d4',
  volcanoes: '#ef4444',
  default: '#3b82f6'
};

const GlobalAnalysis = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getEvents();
        const events = res.events || [];
        
        // Group by category
        const categoryCounts = {};
        events.forEach(e => {
          const catName = e.categories[0]?.title || "Unknown";
          const catId = e.categories[0]?.id || "default";
          if (!categoryCounts[catName]) {
            categoryCounts[catName] = { name: catName, count: 0, id: catId };
          }
          categoryCounts[catName].count += 1;
        });

        const chartData = Object.values(categoryCounts).sort((a, b) => b.count - a.count);
        setData(chartData);
      } catch (error) {
        console.error("Failed to load analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* Header */}
        <section className="mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center space-x-2 text-blue-400 mb-3">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Data Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Global Statistical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Analysis.</span>
            </h2>
            <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
              Aggregate data insights extracted from the NASA EONET telemetry streams, providing a macro view of planetary distrubances.
            </p>
          </motion.div>
        </section>

        {/* Charts & Insights */}
        {loading ? (
          <div className="h-96 glass-card rounded-3xl animate-pulse flex items-center justify-center">
            <TrendingUp size={48} className="text-blue-500/50 animate-bounce" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/5"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Globe size={20} className="text-blue-400"/> Event Distribution by Category
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      tickMargin={15} 
                      angle={-45} 
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: '#ffffff10' }}
                      contentStyle={{ backgroundColor: '#0f172aa0', borderRadius: '12px', border: '1px solid #ffffff20', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.id] || COLORS.default} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Quick Insights */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
                  <Flame size={120} />
                </div>
                <h4 className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-2">Dominant Threat</h4>
                <p className="text-3xl font-bold text-white truncate">{data[0]?.name || "N/A"}</p>
                <div className="mt-4 flex items-center space-x-2">
                   <div className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">
                     {data[0]?.count} Active
                   </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                  <Wind size={120} />
                </div>
                <h4 className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-2">Secondary Threat</h4>
                <p className="text-3xl font-bold text-white truncate">{data[1]?.name || "N/A"}</p>
                <div className="mt-4 flex items-center space-x-2">
                   <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                     {data[1]?.count} Active
                   </div>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </main>
    </div>
  );
};

export default GlobalAnalysis;
