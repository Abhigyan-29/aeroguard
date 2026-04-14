import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import { Layers } from 'lucide-react';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Icons for different categories
const getIcon = (categoryId) => {
  let iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
  if (categoryId === 'wildfires') iconUrl = "https://cdn-icons-png.flaticon.com/512/426/426833.png";
  if (categoryId === 'severeStorms') iconUrl = "https://cdn-icons-png.flaticon.com/512/1779/1779927.png";
  if (categoryId === 'seaLakeIce') iconUrl = "https://cdn-icons-png.flaticon.com/512/2322/2322701.png";
  if (categoryId === 'volcanoes') iconUrl = "https://cdn-icons-png.flaticon.com/512/3661/3661343.png";

  return L.icon({
    iconUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: `custom-marker-${categoryId}`
  });
};

const MapController = ({ center, zoom, onBoundsChange }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.5, easeLinearity: 0.25 });
  }, [center, zoom, map]);

  useEffect(() => {
    if (onBoundsChange) {
      const handleMoveEnd = () => onBoundsChange(map.getBounds());
      map.on('moveend', handleMoveEnd);
      onBoundsChange(map.getBounds());
      return () => map.off('moveend', handleMoveEnd);
    }
  }, [map, onBoundsChange]);
  return null;
};

const MapView = ({ events, mapCenter, mapZoom, onBoundsChange }) => {
  const [isHeatmap, setIsHeatmap] = useState(false);

  const heatmapData = events.map(event => {
    const geo = event.geometry[0];
    if (!geo || !geo.coordinates || geo.coordinates.length < 2 || Array.isArray(geo.coordinates[0])) return null;
    return [geo.coordinates[1], geo.coordinates[0], 500]; // lat, lng, generic max intensity
  }).filter(Boolean);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl group">
      
      {/* UI Toggles */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
         <button 
           onClick={() => setIsHeatmap(!isHeatmap)}
           className="glass shadow-xl px-4 py-2 rounded-xl border border-white/10 flex items-center space-x-2 w-fit bg-[#0a0a0a]/80 text-white hover:bg-gray-800 transition-colors"
         >
           <Layers size={16} className="text-blue-400" />
           <span className="text-xs font-bold uppercase tracking-wider">{isHeatmap ? "Switch to Markers" : "Enable Heatmap"}</span>
         </button>
      </div>

      <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; Stadia Maps'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        <MapController center={mapCenter} zoom={mapZoom} onBoundsChange={onBoundsChange} />

        {isHeatmap && heatmapData.length > 0 ? (
          <HeatmapLayer
            fitBoundsOnLoad={false}
            points={heatmapData}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            intensityExtractor={m => parseFloat(m[2])}
            radius={25}
            blur={20}
          />
        ) : (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={60} spiderfyOnMaxZoom={true}>
            {events.map((event) => {
              if (!event.geometry || event.geometry.length === 0) return null;
              
              const geo = event.geometry[0];
              const eventDate = new Date(geo.date).getTime();
              const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
              
              // Only hide older markers if we aren't using the heatmap to prevent extreme lag. 
              // Heatmap can handle thousands of points efficiently, but Markers cannot.
              if (eventDate < twoDaysAgo) return null;

              if (!geo.coordinates || geo.coordinates.length < 2 || Array.isArray(geo.coordinates[0])) return null;

              const [lng, lat] = geo.coordinates;
              const category = event.categories[0]?.id;

              return (
                <Marker key={event.id} position={[lat, lng]} icon={getIcon(category)}>
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-gray-900 border-b pb-1 mb-2">{event.title}</h3>
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p className="flex justify-between"><span className="font-semibold">Type:</span><span className="capitalize">{event.categories[0]?.title}</span></p>
                        <p className="flex justify-between"><span className="font-semibold">Last Update:</span><span>{new Date(geo.date).toLocaleDateString()}</span></p>
                      </div>
                      <a href={`https://eonet.gsfc.nasa.gov/api/v3/events/${event.id}`} target="_blank" rel="noreferrer" className="mt-3 block text-center py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">Source Data</a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* Map Decoration Overlay */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none flex flex-col gap-3">
        <div className="glass shadow-xl px-4 py-2 rounded-full border border-white/10 flex items-center space-x-2 w-fit">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-widest uppercase">Live Data Stream</span>
        </div>
        
        {!isHeatmap && (
          <div className="glass shadow-xl px-3 py-1.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 flex items-center space-x-2 w-fit">
            <span className="text-[10px] font-bold text-yellow-500 tracking-wider uppercase">⚡ Focus Mode: Last 48 hrs</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;