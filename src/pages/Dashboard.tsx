import { useEffect, useState } from "react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, TrendingUp, RefreshCw, Plane, Route } from "lucide-react";
import { apiService } from "@/services/api";

const Dashboard = () => {
  const [airlines, setAirlines] = useState<string[]>([]);
  const [routes, setRoutes] = useState<{from: string, to: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metaResponse = await apiService.getDatasetMeta();
        if (metaResponse.data?.airlines) {
          setAirlines(metaResponse.data.airlines);
        }
        
        // Create routes from the data
        if (metaResponse.data?.from_top && metaResponse.data?.to_top) {
          const routeData = [];
          for (const [from, fromCount] of Object.entries(metaResponse.data.from_top)) {
            for (const [to, toCount] of Object.entries(metaResponse.data.to_top)) {
              if (from !== to) {
                routeData.push({
                  from: from,
                  to: to,
                  count: Math.min(Number(fromCount), Number(toCount))
                });
              }
            }
          }
          // Sort by count and take top 20
          setRoutes(routeData.sort((a, b) => b.count - a.count).slice(0, 20));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Airport Operations Dashboard
          </h1>
          <p className="text-black mt-1">
            Real-time insights and analytics for flight scheduling optimization
          </p>
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Stats */}
      <DashboardStats />

      {/* Airlines and Routes Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Airlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Plane className="h-5 w-5 text-primary" />
              Available Airlines
            </CardTitle>
            <CardDescription className="text-black">
              All airlines operating at this airport
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {airlines.map((airline, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-black">
                  {airline}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-black mt-3">
              Total: {airlines.length} airlines
            </p>
          </CardContent>
        </Card>

        {/* Top Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Route className="h-5 w-5 text-success" />
              Top Routes
            </CardTitle>
            <CardDescription className="text-black">
              Most frequent flight routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {routes.map((route, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-black font-medium">
                    {route.from} → {route.to}
                  </span>
                  <Badge variant="outline" className="text-black">
                    {route.count} flights
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertCircle className="h-5 w-5 text-warning" />
              Recent Alerts
            </CardTitle>
            <CardDescription className="text-black">
              Latest operational alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-black">High Queue Burden Detected</p>
                  <p className="text-xs text-black">Runway 24L experiencing delays</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-black">Weather Impact Warning</p>
                  <p className="text-xs text-black">Strong winds affecting departures</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Medium</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-black">Green Window Optimization</p>
                  <p className="text-xs text-black">15% improvement in slot utilization</p>
                </div>
                <Badge variant="secondary" className="bg-success text-success-foreground">Success</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Activity className="h-5 w-5 text-success" />
              System Status
            </CardTitle>
            <CardDescription className="text-black">
              Current status of airport scheduling systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Flight Data Feed</span>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Weather Service</span>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Prediction Engine</span>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">API Response Time</span>
                <Badge variant="outline">
                  47ms
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black">Last Update</span>
                <span className="text-xs text-black">2 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-black">
            Frequently used operations and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/predictions'}
            >
              Run Delay Prediction
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/routes'}
            >
              Analyze Route Performance
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.location.href = '/config'}
            >
              Configure Runway Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;