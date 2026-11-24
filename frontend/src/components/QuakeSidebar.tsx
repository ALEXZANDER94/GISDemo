import { useEffect, useState } from "react";

interface QuakeFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string | null;
    tsunami: number;
    alert: string | null;
  };
  geometry: {
    coordinates: number[]; // [longitude, latitude, depth]
  };
}

interface QuakeResponse {
  features: QuakeFeature[];
}

interface QuakeSidebarProps {
  period: string;
  minMag: string;
  count?: number;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5062";

function magColor(mag: number | null) {
  if (mag === null) return "bg-gray-500";
  if (mag >= 7) return "bg-red-700";
  if (mag >= 5) return "bg-orange-500";
  if (mag >= 2.5) return "bg-yellow-400 text-black";
  return "bg-gray-500";
}

export default function QuakeSidebar({ period, minMag, count = 10 }: QuakeSidebarProps) {
  const query = new URLSearchParams({ period, minMag, count: String(count) }).toString();

  // Results are tagged with the query they came from; if it doesn't match the
  // current query, a request is still in flight and we show the loading state.
  const [result, setResult] = useState<{
    query: string;
    quakes: QuakeFeature[];
    error: string | null;
  } | null>(null);
  const loading = result?.query !== query;
  const quakes = result?.quakes ?? [];
  const error = result?.error ?? null;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/quakes/top?${query}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data: QuakeResponse = await res.json();
        setResult({ query, quakes: data.features ?? [], error: null });
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : "Failed to load earthquakes";
        setResult({ query, quakes: [], error: message });
      }
    }

    load();
    return () => controller.abort();
  }, [query]);

  return (
    <aside className="w-full md:flex-1 min-w-0 h-[50vh] overflow-y-auto border border-gray-600 rounded-md p-3 text-left">
      <h3 className="text-lg font-semibold mb-2">Most Significant Earthquakes</h3>
      <p className="text-xs opacity-70 mb-3">
        Top {count} by magnitude · past {period}
      </p>

      {loading && <p className="text-sm">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && quakes.length === 0 && (
        <p className="text-sm">No earthquakes reported.</p>
      )}

      {!loading && !error && (
        <ol className="flex flex-col gap-2">
          {quakes.map((q) => {
            const { mag, place, time, url, tsunami } = q.properties;
            const depth = q.geometry.coordinates[2];
            return (
              <li key={q.id} className="flex items-start gap-3 p-2 rounded-md bg-black/10">
                <span
                  className={`shrink-0 w-12 text-center font-bold rounded px-1 py-0.5 text-white ${magColor(mag)}`}
                >
                  {mag?.toFixed(1) ?? "?"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" title={place ?? undefined}>
                    {place ?? "Unknown location"}
                  </p>
                  <p className="text-xs opacity-70">
                    {new Date(time).toLocaleString()}
                    {depth !== undefined && ` · ${depth.toFixed(1)} km deep`}
                    {tsunami === 1 && " · Tsunami alert"}
                  </p>
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer" className="text-xs underline">
                      USGS details
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </aside>
  );
}
