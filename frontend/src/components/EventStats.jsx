import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Wind, Snowflake, MapPin } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-4 rounded-2xl flex items-center space-x-4"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const EventStats = ({ events }) => {
  const getCount = (category) => {
    return events.filter(e => e.categories[0]?.id === category).length;
  };

  const wildfireCount = getCount('wildfires');
  const stormCount = getCount('severeStorms');
  const iceCount = getCount('seaLakeIce');
  const totalCount = events.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        icon={Activity} 
        label="Total Events" 
        value={totalCount} 
        color="bg-blue-500/20 text-blue-400" 
      />
      <StatCard 
        icon={Flame} 
        label="Wildfires" 
        value={wildfireCount} 
        color="bg-orange-500/20 text-orange-400" 
      />
      <StatCard 
        icon={Wind} 
        label="Storms" 
        value={stormCount} 
        color="bg-emerald-500/20 text-emerald-400" 
      />
      <StatCard 
        icon={Snowflake} 
        label="Ice Bergs" 
        value={iceCount} 
        color="bg-cyan-500/20 text-cyan-400" 
      />
    </div>
  );
};

export default EventStats;
