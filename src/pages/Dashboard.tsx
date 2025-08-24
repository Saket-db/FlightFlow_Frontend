import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, TrendingUp, RefreshCw } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Airport Operations Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights and analytics for flight scheduling optimization
          </p>
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Stats */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              Latest operational alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">High Queue Burden Detected</p>
                  <p className="text-xs text-muted-foreground">Runway 24L experiencing delays</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Weather Impact Warning</p>
                  <p className="text-xs text-muted-foreground">Strong winds affecting departures</p>
                </div>
                <Badge className="bg-warning text-warning-foreground">Medium</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Green Window Optimization</p>
                  <p className="text-xs text-muted-foreground">15% improvement in slot utilization</p>
                </div>
                <Badge variant="secondary" className="bg-success text-success-foreground">Success</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              System Status
            </CardTitle>
            <CardDescription>
              Current status of airport scheduling systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Flight Data Feed</span>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Weather Service</span>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Prediction Engine</span>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant="outline">
                  47ms
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Update</span>
                <span className="text-xs text-muted-foreground">2 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Frequently used operations and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              Run Delay Prediction
            </Button>
            
            <Button variant="outline" className="justify-start">
              Analyze Route Performance
            </Button>
            
            <Button variant="outline" className="justify-start">
              Configure Runway Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;