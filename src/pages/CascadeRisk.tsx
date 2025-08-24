import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Plane } from "lucide-react";

const CascadeRisk = () => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cascade Risk Assessment</h1>
        <p className="text-muted-foreground mt-1">
          Risk analysis and mitigation strategies for flight operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Risk Analysis
            </CardTitle>
            <CardDescription>Current risk levels and assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Risk analysis data will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Mitigation Tools
            </CardTitle>
            <CardDescription>Risk reduction strategies and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Mitigation tools will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CascadeRisk;