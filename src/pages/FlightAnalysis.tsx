import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, Plane } from "lucide-react";

const FlightAnalysis = () => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flight Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Detailed flight statistics, slot utilization, and green window analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Slot Statistics
            </CardTitle>
            <CardDescription>Current slot utilization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Flight analysis data will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-success" />
              Green Window Analysis
            </CardTitle>
            <CardDescription>Optimal departure time windows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Green window data will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlightAnalysis;