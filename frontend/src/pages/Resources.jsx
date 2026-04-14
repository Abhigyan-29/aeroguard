import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, Code, Layers, ShieldCheck, Database } from "lucide-react";

const ResourceCard = ({ icon: Icon, title, desc, link, label }) => (
  <motion.a 
    href={link}
    target="_blank"
    rel="noreferrer"
    whileHover={{ y: -5 }}
    className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col h-full group"
  >
    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
      <Icon size={24} className="text-blue-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed flex-grow mb-6">
      {desc}
    </p>
    <div className="flex items-center text-blue-400 text-sm font-bold uppercase tracking-wider mt-auto group-hover:text-blue-300 transition-colors">
      <span>{label}</span>
      <ExternalLink size={14} className="ml-2" />
    </div>
  </motion.a>
);

const Resources = () => {
  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* Header */}
        <section className="mb-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-4">
              <div className="px-4 py-2 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full flex items-center space-x-2">
                <BookOpen size={16} />
                <span>Developer Hub</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              TerraPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Resources.</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Access the underlying APIs, review system architectures, and explore documentation critical to planetary monitoring and intelligence gathering.
            </p>
          </motion.div>
        </section>

        {/* Grid */}
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <ResourceCard 
                icon={Database}
                title="NASA EONET API V3"
                desc="The official Earth Observatory Natural Event Tracker API used to source real-time geological and meteorological event telemetry."
                link="https://eonet.gsfc.nasa.gov/docs/v3"
                label="API Documentation"
              />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <ResourceCard 
                icon={Layers}
                title="Leaflet Architecture"
                desc="Understand the high-performance rendering engine we use to map global anomalies, featuring advanced marker clustering."
                link="https://leafletjs.com/reference.html"
                label="Leaflet Docs"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <ResourceCard 
                icon={Code}
                title="React Ecosystem"
                desc="TerraPulse is built on a modern React architecture powered by optimized lifecycle hooks and state propagation techniques."
                link="https://react.dev/"
                label="React Details"
              />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              <ResourceCard 
                icon={ShieldCheck}
                title="NASA Open Data Program"
                desc="Explore thousands of datasets released by NASA to encourage global collaboration and environmental insights."
                link="https://data.nasa.gov/"
                label="Data Catalog"
              />
            </motion.div>
          </div>
        </section>

        {/* Footer info box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-blue-900/40 to-cyan-900/20 border border-blue-500/20 p-8 rounded-3xl text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">Open Source Dedication</h3>
          <p className="text-gray-400 max-w-3xl mx-auto">
            TerraPulse was designed with a focus on delivering high-fidelity environmental intelligence. The platform leverages modern web technologies to process and visualize public data provided by the National Aeronautics and Space Administration.
          </p>
        </motion.div>

      </main>
    </div>
  );
};

export default Resources;
