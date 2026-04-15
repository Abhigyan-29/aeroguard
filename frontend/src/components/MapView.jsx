import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3";
import { Layers } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ---------------- ICONS ---------------- */

const getIcon = (categoryId) => {
  let iconUrl =
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";

  if (categoryId === "wildfires")
    iconUrl = "https://cdn-icons-png.flaticon.com/512/426/426833.png";

  if (categoryId === "severeStorms")
    iconUrl = "https://cdn-icons-png.flaticon.com/512/1779/1779927.png";

  if (categoryId === "seaLakeIce")
    iconUrl = "https://cdn-icons-png.flaticon.com/512/2322/2322701.png";

  if (categoryId === "volcanoes")
    iconUrl = "https://cdn-icons-png.flaticon.com/512/3661/3661343.png";

  return L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

/* ---------------- MAP CONTROLLER ---------------- */

const MapController = ({ center, zoom, onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, {
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (onBoundsChange) {
      const handleMove = () => {
        onBoundsChange(map.getBounds());
      };

      map.on("moveend", handleMove);
      onBoundsChange(map.getBounds());

      return () => map.off("moveend", handleMove);
    }
  }, [map, onBoundsChange]);

  return null;
};

/* ---------------- MAIN COMPONENT ---------------- */

const MapView = ({ events, mapCenter, mapZoom, onBoundsChange }) => {
  const [isHeatmap, setIsHeatmap] = useState(false);

  /* -------- Heatmap Data -------- */
  const heatmapData = events
    .map((event) => {
      const geo = event.geometry?.[0];

      if (
        !geo ||
        !geo.coordinates ||
        geo.coordinates.length < 2 ||
        Array.isArray(geo.coordinates[0])
      )
        return null;

      return [geo.coordinates[1], geo.coordinates[0], 500];
    })
    .filter(Boolean);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

      {/* 🔥 Toggle Button */}
      <div className="absolute top-6 right-6 z-[1000]">
        <button
          onClick={() => setIsHeatmap(!isHeatmap)}
          className="bg-black/80 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Layers size={16} />
          {isHeatmap ? "Markers" : "Heatmap"}
        </button>
      </div>

      {/* 🗺 MAP */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        <MapController
          center={mapCenter}
          zoom={mapZoom}
          onBoundsChange={onBoundsChange}
        />

        {/* 🔥 HEATMAP */}
        {isHeatmap && heatmapData.length > 0 ? (
          <HeatmapLayer
            points={heatmapData}
            longitudeExtractor={(m) => m[1]}
            latitudeExtractor={(m) => m[0]}
            intensityExtractor={(m) => m[2]}
          />
        ) : (
          <>
            {/* 🔥 MARKERS */}
            {events.map((event) => {
              const geo = event.geometry?.[0];
              if (!geo) return null;

              const eventDate = new Date(geo.date).getTime();
              const twoDaysAgo =
                Date.now() - 2 * 24 * 60 * 60 * 1000;

              if (eventDate < twoDaysAgo) return null;

              if (
                !geo.coordinates ||
                geo.coordinates.length < 2 ||
                Array.isArray(geo.coordinates[0])
              )
                return null;

              const [lng, lat] = geo.coordinates;
              const category = event.categories?.[0]?.id;

              return (
                <Marker
                  key={event.id}
                  position={[lat, lng]}
                  icon={getIcon(category)}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-gray-800">
                        {event.title}
                      </h3>

                      <p className="text-sm text-gray-600 mt-2">
                        Type: {event.categories?.[0]?.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        {new Date(geo.date).toLocaleDateString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}
      </MapContainer>

      {/* 🔴 Live Badge */}
      <div className="absolute top-6 left-6 z-[1000] bg-black/80 px-4 py-2 rounded-full text-white text-xs flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        LIVE DATA
      </div>
    </div>
  );
};

export default MapView;