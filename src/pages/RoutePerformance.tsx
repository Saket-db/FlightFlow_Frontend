import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, TrendingUp, Plane } from "lucide-react";
import { apiService } from "@/services/api";
import { Badge } from "@/components/ui/badge";

const RoutePerformance = () => {
  const [topRoutes, setTopRoutes] = useState<any[]>([]);
  const [topAirlines, setTopAirlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesResponse, airlinesResponse] = await Promise.all([
          apiService.getTopRoutes(),
          apiService.getTopAirlines()
        ]);
        
        setTopRoutes(routesResponse.data || []);
        setTopAirlines(airlinesResponse.data || []);
      } catch (error) {
        console.error('Error fetching route performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Route Performance</h1>
        <p className="text-black mt-1">
          Top routes, airline rankings, and route-specific performance analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Route className="h-5 w-5 text-primary" />
              Top Routes
            </CardTitle>
            <CardDescription className="text-black">Best performing flight routes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-black">Loading route data...</p>
              </div>
            ) : topRoutes.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg mb-4">
                  <p className="text-2xl font-bold text-black">{topRoutes.length}</p>
                  <p className="text-sm text-black">Routes Analyzed</p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {topRoutes.slice(0, 5).map((route, index) => (
                    <div key={route.route ?? `${route.from}-${route.to}-${index}`}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-black">
                          {route.route || `${route.From || route.from || 'Route'} → ${route.To || route.to || ''}`}
                        </span>
                        <Badge variant="secondary" className="bg-blue-100 text-black">
                          {route.flights ?? route.flight_count ?? 0} flights
                        </Badge>
                      </div>
                      <p className="text-xs text-black mt-1">
                        Avg Delay: {(route.avg_dep_delay ?? route.avg_delay)?.toFixed?.(1) || 'N/A'} min
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-black">No route data available.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <TrendingUp className="h-5 w-5 text-success" />
              Airline Rankings
            </CardTitle>
            <CardDescription className="text-black">Performance rankings by airline</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-black">Loading airline data...</p>
              </div>
            ) : topAirlines.length > 0 ? (
              <div className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                  <p className="text-2xl font-bold text-black">{topAirlines.length}</p>
                  <p className="text-sm text-black">Airlines Ranked</p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {topAirlines.slice(0, 5).map((airline, index) => (
                    <div key={airline.airline ?? index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-black">
                          {airline.airline || `Airline ${index + 1}`}
                        </span>
                        <Badge variant="secondary" className="bg-green-100 text-black">
                          {airline.flights ?? airline.flight_count ?? 0} flights
                        </Badge>
                      </div>
                      <p className="text-xs text-black mt-1">
                        Avg Delay: {(airline.avg_dep_delay ?? airline.avg_delay)?.toFixed?.(1) || 'N/A'} min
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-black">No airline data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoutePerformance;