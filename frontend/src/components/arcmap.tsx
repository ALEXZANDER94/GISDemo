import { useRef, useEffect } from "react";
import "@arcgis/core/assets/esri/themes/dark/main.css";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

interface mapProperties {
  period: string;
  minMag: string;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5062";

function createQuakeLayer({ period, minMag }: mapProperties) {
  const params = new URLSearchParams({ period, minMag });
  return new GeoJSONLayer({
    url: `${API_BASE}/api/quakes?${params}`,
    outFields: ["*"],
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-marker",
        style: "circle",
        outline: { color: [255, 255, 255, 0.6], width: 0.5 },
      },
      visualVariables: [
        {
          type: "size",
          field: "mag",
          stops: [
            { value: 2.5, size: 4 },
            { value: 5, size: 14 },
            { value: 7, size: 36 },
          ],
        },
        {
          type: "color",
          field: "mag",
          stops: [
            { value: 2.5, color: "#fee08b" },
            { value: 5, color: "#fc8d59" },
            { value: 7, color: "#d73027" },
          ],
        },
      ],
    },
    popupTemplate: {
      title: "M{mag}: {place}",
      expressionInfos: [
        {
          name: "when",
          title: "Time",
          expression: "Text(Date($feature.time), 'MMM D, Y h:mm A')",
        },
      ],
      content: [
        {
          type: "fields",
          fieldInfos: [
            { fieldName: "mag", label: "Magnitude" },
            { fieldName: "depth", label: "Depth (km)" },
            { fieldName: "expression/when", label: "Time" },
          ],
        },
        {
          type: "text",
          text: "<a href='{url}' target='_blank'>Open the USGS event page</a>",
        },
      ],
    },
  });
}

export default function ArcMap({ properties }: { properties: mapProperties }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const { period, minMag } = properties;

  // Create the map and view once.
  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({ basemap: "dark-gray-vector" });
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [-119.0187, 35.3733], // [longitude, latitude]
      zoom: 5,
    });
    mapRef.current = map;

    return () => {
      mapRef.current = null;
      view.destroy();
    };
  }, []);

  // Swap the earthquake layer whenever the filters change (keeps the current zoom/extent).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layer = createQuakeLayer({ period, minMag });
    map.add(layer);

    return () => {
      map.remove(layer);
      layer.destroy();
    };
  }, [period, minMag]);

  return <div ref={mapDiv} className="h-[50vh] w-full md:w-3/4" />;
}
