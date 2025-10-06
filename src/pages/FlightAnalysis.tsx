import { useEffect, useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { apiService } from "@/services/api";

const FlightAnalysis = () => {
  const [slotData, setSlotData] = useState<any[]>([]);
  const [greenWindows, setGreenWindows] = useState<any[]>([]);
  const [airlineData, setAirlineData] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback samples
  const sampleSlotData = [
    { slot: "06:00", slot_label: "06:00", p50_delay: 5, p90_delay: 12, flights: 8, avg_dep_delay: 6.5 },
    { slot: "06:15", slot_label: "06:15", p50_delay: 3, p90_delay: 8, flights: 6, avg_dep_delay: 4.2 },
    { slot: "06:30", slot_label: "06:30", p50_delay: 7, p90_delay: 15, flights: 10, avg_dep_delay: 9.1 },
    { slot: "06:45", slot_label: "06:45", p50_delay: 4, p90_delay: 10, flights: 7, avg_dep_delay: 6.8 },
    { slot: "07:00", slot_label: "07:00", p50_delay: 9, p90_delay: 18, flights: 12, avg_dep_delay: 12.3 },
    { slot: "07:15", slot_label: "07:15", p50_delay: 6, p90_delay: 14, flights: 9, avg_dep_delay: 8.7 },
    { slot: "07:30", slot_label: "07:30", p50_delay: 11, p90_delay: 22, flights: 15, avg_dep_delay: 15.2 },
    { slot: "07:45", slot_label: "07:45", p50_delay: 8, p90_delay: 16, flights: 11, avg_dep_delay: 11.4 },
  ];

  const sampleAirlineData = [
    { airline: "AI", avg_dep_delay: 8.5, flights: 45, p90_dep_delay: 18, p50_dep_delay: 6.2 },
    { airline: "QP", avg_dep_delay: 6.2, flights: 32, p90_dep_delay: 14, p50_dep_delay: 4.1 },
    { airline: "QO", avg_dep_delay: 9.1, flights: 28, p90_dep_delay: 20, p50_dep_delay: 7.8 },
    { airline: "OV", avg_dep_delay: 5.8, flights: 35, p90_dep_delay: 12, p50_dep_delay: 3.9 },
    { airline: "GF", avg_dep_delay: 7.3, flights: 42, p90_dep_delay: 16, p50_dep_delay: 5.4 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsResponse, greenResponse, airlinesResponse, routesResponse] = await Promise.all([
          apiService.getSlotStats(),
          apiService.getGreenWindows(),
          apiService.getTopAirlines(),
          apiService.getTopRoutes(),
        ]);

        setSlotData(
          Array.isArray(slotsResponse?.data) && slotsResponse.data.length
            ? slotsResponse.data
            : sampleSlotData
        );

        setGreenWindows(
          greenResponse?.data?.length
            ? greenResponse.data
            : [
                { window: "06:15-06:30", flights: 6, avg_delay: 3.2, efficiency: "High" },
                { window: "06:45-07:00", flights: 7, avg_delay: 4.1, efficiency: "High" },
                { window: "07:15-07:30", flights: 9, avg_delay: 6.3, efficiency: "Medium" },
                { window: "08:00-08:15", flights: 5, avg_delay: 2.8, efficiency: "High" },
                { window: "08:30-08:45", flights: 8, avg_delay: 5.1, efficiency: "Medium" },
              ]
        );

        setAirlineData(airlinesResponse?.data?.length ? airlinesResponse.data : sampleAirlineData);
        setRouteData(routesResponse?.data?.length ? routesResponse.data : [
          { route: "BOM-DEL", flights: 90, avg_delay: 8.5, p90_delay: 18.2 },
          { route: "BOM-BLR", flights: 63, avg_delay: 6.8, p90_delay: 15.1 },
          { route: "BOM-HYD", flights: 42, avg_delay: 7.2, p90_delay: 16.8 },
          { route: "BOM-MAA", flights: 42, avg_delay: 9.1, p90_delay: 20.3 },
          { route: "BOM-CCU", flights: 28, avg_delay: 5.9, p90_delay: 13.7 },
        ]);
      } catch (e) {
        console.error("Error fetching flight analysis data:", e);
        setSlotData(sampleSlotData);
        setGreenWindows([
          { window: "06:15-06:30", flights: 6, avg_delay: 3.2, efficiency: "High" },
          { window: "06:45-07:00", flights: 7, avg_delay: 4.1, efficiency: "High" },
          { window: "07:15-07:30", flights: 9, avg_delay: 6.3, efficiency: "Medium" },
          { window: "08:00-08:15", flights: 5, avg_delay: 2.8, efficiency: "High" },
          { window: "08:30-08:45", flights: 8, avg_delay: 5.1, efficiency: "Medium" },
        ]);
        setAirlineData(sampleAirlineData);
        setRouteData([
          { route: "BOM-DEL", flights: 90, avg_delay: 8.5, p90_delay: 18.2 },
          { route: "BOM-BLR", flights: 63, avg_delay: 6.8, p90_delay: 15.1 },
          { route: "BOM-HYD", flights: 42, avg_delay: 7.2, p90_delay: 16.8 },
          { route: "BOM-MAA", flights: 42, avg_delay: 9.1, p90_delay: 20.3 },
          { route: "BOM-CCU", flights: 28, avg_delay: 5.9, p90_delay: 13.7 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const slots = slotData?.length ? slotData : sampleSlotData;
  const airlines = airlineData?.length ? airlineData : sampleAirlineData;

  return (
    <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Flight Analysis</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Analysis of time-slot congestion, airline performance, and projected delays
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-900">
              {slots.length}
            </div>
            <p className="text-xs text-neutral-500 mt-1">15-minute buckets</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Utilized Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-900">
              {slots.filter(s => (s.flights || 0) > 0).length}
            </div>
            <p className="text-xs text-neutral-500 mt-1">Slots with one or more flights</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-900">
              {Math.round((slots.filter(s => (s.flights || 0) > 0).length / slots.length) * 100)}%
            </div>
            <p className="text-xs text-neutral-500 mt-1">Share of used slots</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Avg Queue Burden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-neutral-900">
              {Math.round(slots.reduce((sum, s) => sum + (s.p90_delay || 0), 0) / slots.length)} min
            </div>
            <p className="text-xs text-neutral-500 mt-1">Average P90 delay across slots</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Routes & Airlines (merged) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Top Routes</CardTitle>
            <CardDescription className="text-sm text-neutral-500">Highest-impact routes (by flights)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">Loading route data...</div>
            ) : routeData && routeData.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center p-3 bg-white rounded-lg mb-3">
                  <p className="text-2xl font-bold text-neutral-900">{routeData.length}</p>
                  <p className="text-sm text-neutral-500">Routes Analyzed</p>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {routeData.slice(0, 8).map((r: any, idx: number) => {
                    const key = r.route ?? `${r.from ?? r.From ?? 'route'}-${r.to ?? r.To ?? ''}-${idx}`;
                    const label = r.route ?? `${r.From ?? r.from ?? ''} → ${r.To ?? r.to ?? ''}`;
                    const flights = r.flights ?? r.flight_count ?? 0;
                    const avgDelay = r.avg_dep_delay ?? r.avg_delay ?? r.p50_dep_delay ?? null;
                    return (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg border border-neutral-100 flex items-center justify-between">
                        <div className="text-sm font-medium text-neutral-900">{label}</div>
                        <div className="text-right">
                          <div className="text-xs text-neutral-600">{flights} flights</div>
                          <div className="text-xs text-neutral-500">Avg: {avgDelay !== null ? avgDelay.toFixed?.(1) ?? avgDelay : 'N/A'} min</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">No route data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Airline Rankings</CardTitle>
            <CardDescription className="text-sm text-neutral-500">Performance rankings by airline</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">Loading airline data...</div>
            ) : airlineData && airlineData.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center p-3 bg-white rounded-lg mb-3">
                  <p className="text-2xl font-bold text-neutral-900">{airlineData.length}</p>
                  <p className="text-sm text-neutral-500">Airlines Ranked</p>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {airlineData.slice(0, 8).map((a: any, idx: number) => {
                    const key = a.airline ?? `airline-${idx}`;
                    const label = a.airline ?? `Airline ${idx + 1}`;
                    const flights = a.flights ?? a.flight_count ?? 0;
                    const avgDelay = a.avg_dep_delay ?? a.avg_delay ?? null;
                    return (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg border border-neutral-100 flex items-center justify-between">
                        <div className="text-sm font-medium text-neutral-900">{label}</div>
                        <div className="text-right">
                          <div className="text-xs text-neutral-600">{flights} flights</div>
                          <div className="text-xs text-neutral-500">Avg: {avgDelay !== null ? avgDelay.toFixed?.(1) ?? avgDelay : 'N/A'} min</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">No airline data available.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slot Analysis */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-neutral-900">By Slot</CardTitle>
          <CardDescription className="text-neutral-500">
            P90 delay and flight volume by 15-minute slot
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Busiest Slots */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Busiest Slots (Top 20)</h4>
              <div className="h-[320px] rounded-lg border border-neutral-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...slots].sort((a, b) => (b.flights || 0) - (a.flights || 0)).slice(0, 20)}
                    margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="slot_label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="flights" fill="#2563EB" name="Flights" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projected P50/P90 */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Projected Delay Trends</h4>
              <div className="h-[320px] rounded-lg border border-neutral-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slots} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="slot_label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="p50_delay" stroke="#10B981" strokeWidth={2.5} dot={false} name="P50 Delay" />
                    <Line type="monotone" dataKey="p90_delay" stroke="#DC2626" strokeWidth={2.5} dot={false} name="P90 Delay" />
                    <Line type="monotone" dataKey="avg_dep_delay" stroke="#2563EB" strokeWidth={2} dot={false} name="Avg Delay" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Airline Analysis */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-neutral-900">Airlines</CardTitle>
          <CardDescription className="text-neutral-500">
            Average and percentile delays by airline
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avg delay by airline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Average Departure Delay</h4>
              <div className="h-[320px] rounded-lg border border-neutral-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={airlines.slice(0, 15)} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="airline" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_dep_delay" fill="#2563EB" name="Avg Delay" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution summary per airline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Delay Distribution Summary</h4>
              <div className="h-[320px] rounded-lg border border-neutral-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={airlines} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="airline" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_dep_delay" fill="#2563EB" name="Avg" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="p50_dep_delay" fill="#10B981" name="P50" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="p90_dep_delay" fill="#DC2626" name="P90" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routes Analysis */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-neutral-900">Routes</CardTitle>
          <CardDescription className="text-neutral-500">
            Flight counts and average delays by route
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flight count by route */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Flight Count</h4>
              <div className="h-[320px] rounded-lg border border-neutral-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeData.slice(0, 15)} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="flights" fill="#10B981" name="Flights" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Avg delay by route (if provided) */}
            {/* <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-700">Average Delay</h4>
              <div className="h-[320px] rounded-lg border border-neutral-200 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeData.slice(0, 15)} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_delay" fill="#2563EB" name="Avg Delay" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Green Windows */}
      <Card className="shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-neutral-900">Best (Green) Windows</CardTitle>
          <CardDescription className="text-neutral-500">
            Optimal time slots with minimal delays
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {greenWindows.map((w, idx) => {
              // Support backend shape as well as fallback shape
              const windowLabel = w.window || w.slot_label || w.slot || "—";
              const flights = w.flights ?? w.count ?? "—";
              const avgDelay = w.avg_delay ?? w.avg_dep_delay ?? w.p50_dep_delay ?? "—";
              const efficiency =
                w.efficiency ??
                (w.p90_dep_delay !== undefined
                  ? w.p90_dep_delay <= 25
                    ? "High"
                    : w.p90_dep_delay <= 35
                      ? "Medium"
                      : "Low"
                  : "High");

              const badgeClass =
                efficiency === "High"
                  ? "bg-emerald-500"
                  : efficiency === "Medium"
                  ? "bg-amber-500"
                  : "bg-red-500";

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-neutral-900">{windowLabel}</h4>
                    <Badge className={`${badgeClass} text-white`}>{efficiency}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-neutral-700">
                    <p>Flights: {flights}</p>
                    <p>Avg Delay: {avgDelay} min</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightAnalysis;
