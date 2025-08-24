import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, TrendingUp, Plane } from "lucide-react";

const RoutePerformance = () => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Route Performance</h1>
        <p className="text-muted-foreground mt-1">
          Top routes, airline rankings, and route-specific performance analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              Top Routes
            </CardTitle>
            <CardDescription>Best performing flight routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Route performance data will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Airline Rankings
            </CardTitle>
            <CardDescription>Performance rankings by airline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Airline rankings will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoutePerformance;