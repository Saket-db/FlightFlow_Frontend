import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Cloud, Plane } from "lucide-react";

const Configuration = () => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Runway settings, weather conditions, and system parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Runway Configuration
            </CardTitle>
            <CardDescription>Active runways and operational settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Runway configuration will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-success" />
              Weather Conditions
            </CardTitle>
            <CardDescription>Current weather impact on operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Weather data will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuration;