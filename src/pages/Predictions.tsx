import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, Plane } from "lucide-react";

const Predictions = () => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Flight Predictions</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered delay predictions and what-if scenario analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Delay Predictions
            </CardTitle>
            <CardDescription>Machine learning powered delay forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Prediction models will be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-success" />
              What-If Scenarios
            </CardTitle>
            <CardDescription>Impact analysis for schedule changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-airplane-fly" />
              <p className="text-muted-foreground">Scenario analysis will be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Predictions;