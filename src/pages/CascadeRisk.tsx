import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Clock, Plane, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { apiService } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const CascadeRisk = () => {
  const [cascadeData, setCascadeData] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");

  // Sample cascade risk data (fallback when API fails)
  const sampleCascadeData = [
    {
      flight_id: "AI1001",
      origin: "BOM",
      destination: "DEL",
      scheduled_time: "07:00",
      delay: 22,
      risk_level: "High",
      affected_flights: 3,
      cascade_impact: 45,
      mitigation_status: "In Progress"
    },
    {
      flight_id: "QP2001",
      origin: "BOM",
      destination: "BLR",
      scheduled_time: "07:15",
      delay: 18,
      risk_level: "High",
      affected_flights: 2,
      cascade_impact: 32,
      mitigation_status: "Pending"
    },
    {
      flight_id: "QO3001",
      origin: "BOM",
      destination: "HYD",
      scheduled_time: "07:30",
      delay: 15,
      risk_level: "Medium",
      affected_flights: 1,
      cascade_impact: 18,
      mitigation_status: "Resolved"
    },
    {
      flight_id: "OV4001",
      origin: "BOM",
      destination: "MAA",
      scheduled_time: "07:45",
      delay: 12,
      risk_level: "Medium",
      affected_flights: 1,
      cascade_impact: 15,
      mitigation_status: "Resolved"
    },
    {
      flight_id: "GF5001",
      origin: "BOM",
      destination: "CCU",
      scheduled_time: "08:00",
      delay: 8,
      risk_level: "Low",
      affected_flights: 0,
      cascade_impact: 5,
      mitigation_status: "Resolved"
    }
  ];

  // Risk trend data
  const riskTrendData = [
    { hour: 6, high_risk: 0, medium_risk: 1, low_risk: 2 },
    { hour: 7, high_risk: 2, medium_risk: 2, low_risk: 1 },
    { hour: 8, high_risk: 1, medium_risk: 1, low_risk: 3 },
    { hour: 9, high_risk: 0, medium_risk: 1, low_risk: 2 },
    { hour: 10, high_risk: 0, medium_risk: 0, low_risk: 1 },
    { hour: 11, high_risk: 0, medium_risk: 0, low_risk: 0 },
  ];

  useEffect(() => {
    const fetchCascadeData = async () => {
      try {
        const response = await apiService.getCascadeAnalysis();
        if (response.data) {
          setCascadeData(response.data);
          // Calculate risk metrics
          const metrics = {
            total_flights: response.data.length,
            high_risk: response.data.filter((f: any) => f.risk_level === "High").length,
            medium_risk: response.data.filter((f: any) => f.risk_level === "Medium").length,
            low_risk: response.data.filter((f: any) => f.risk_level === "Low").length,
            total_affected: response.data.reduce((sum: number, f: any) => sum + (f.affected_flights || 0), 0),
            avg_cascade_impact: response.data.reduce((sum: number, f: any) => sum + (f.cascade_impact || 0), 0) / response.data.length
          };
          setRiskMetrics(metrics);
        } else {
          // Use sample data
          setCascadeData(sampleCascadeData);
          setRiskMetrics({
            total_flights: sampleCascadeData.length,
            high_risk: sampleCascadeData.filter(f => f.risk_level === "High").length,
            medium_risk: sampleCascadeData.filter(f => f.risk_level === "Medium").length,
            low_risk: sampleCascadeData.filter(f => f.risk_level === "Low").length,
            total_affected: sampleCascadeData.reduce((sum, f) => sum + f.affected_flights, 0),
            avg_cascade_impact: sampleCascadeData.reduce((sum, f) => sum + f.cascade_impact, 0) / sampleCascadeData.length
          });
        }
      } catch (error) {
        console.error('Error fetching cascade data:', error);
        // Use sample data as fallback
        setCascadeData(sampleCascadeData);
        setRiskMetrics({
          total_flights: sampleCascadeData.length,
          high_risk: sampleCascadeData.filter(f => f.risk_level === "High").length,
          medium_risk: sampleCascadeData.filter(f => f.risk_level === "Medium").length,
          low_risk: sampleCascadeData.filter(f => f.risk_level === "Low").length,
          total_affected: sampleCascadeData.reduce((sum, f) => sum + f.affected_flights, 0),
          avg_cascade_impact: sampleCascadeData.reduce((sum, f) => sum + f.cascade_impact, 0) / sampleCascadeData.length
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCascadeData();
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High": return "bg-red-500 text-white";
      case "Medium": return "bg-amber-500 text-white";
      case "Low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getMitigationColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Cascade Risk Analysis</h1>
        <p className="text-black mt-1">
          Monitor and analyze cascade effects of flight delays on downstream operations
        </p>
      </div>

      {/* Risk Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{riskMetrics.total_flights || 0}</div>
            <p className="text-xs text-black">Monitored flights</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskMetrics.high_risk || 0}</div>
            <p className="text-xs text-black">Critical delays</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Affected Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{riskMetrics.total_affected || 0}</div>
            <p className="text-xs text-black">Downstream impact</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Avg Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {riskMetrics.avg_cascade_impact ? Math.round(riskMetrics.avg_cascade_impact) : 0} min
            </div>
            <p className="text-xs text-black">Cascade delay</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Risk Trend by Hour</CardTitle>
          <CardDescription className="text-black">
            Distribution of risk levels throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="high_risk" stroke="#dc2626" strokeWidth={3} name="High Risk" />
              <Line type="monotone" dataKey="medium_risk" stroke="#f59e0b" strokeWidth={2} name="Medium Risk" />
              <Line type="monotone" dataKey="low_risk" stroke="#10b981" strokeWidth={2} name="Low Risk" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Risk Level Distribution</CardTitle>
          <CardDescription className="text-black">
            Current distribution of flights by risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { level: "High Risk", count: riskMetrics.high_risk || 0, color: "#dc2626" },
              { level: "Medium Risk", count: riskMetrics.medium_risk || 0, color: "#f59e0b" },
              { level: "Low Risk", count: riskMetrics.low_risk || 0, color: "#10b981" }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="level" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cascade Risk Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Flight Risk Details</CardTitle>
          <CardDescription className="text-black">
            Detailed analysis of flights with cascade risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cascadeData.map((flight, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                  {/* Flight Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Plane className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-black">{flight.flight_id}</h4>
                      <Badge className={getRiskColor(flight.risk_level)}>
                        {flight.risk_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-black">
                      {flight.origin} → {flight.destination} | {flight.scheduled_time}
                    </p>
                  </div>

                  {/* Delay Info */}
                  <div className="text-center">
                    <p className="text-lg font-bold text-black">{flight.delay} min</p>
                    <p className="text-xs text-black">Delay</p>
                  </div>

                  {/* Cascade Impact */}
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-600">{flight.affected_flights}</p>
                    <p className="text-xs text-black">Affected</p>
                  </div>

                  {/* Total Impact */}
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{flight.cascade_impact} min</p>
                    <p className="text-xs text-black">Total Impact</p>
                  </div>

                  {/* Mitigation Status */}
                  <div className="text-center">
                    <Badge className={getMitigationColor(flight.mitigation_status)}>
                      {flight.mitigation_status}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Mitigation Plan
                  </Button>
                  <Button size="sm" variant="outline">
                    Update Status
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Mitigation Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Risk Mitigation Actions</CardTitle>
          <CardDescription className="text-black">
            Recommended actions to reduce cascade risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Immediate Actions */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Immediate Actions
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-black">Reschedule AI1001</p>
                    <p className="text-xs text-black">Move to 08:00 slot to reduce cascade</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-black">Optimize QP2001</p>
                    <p className="text-xs text-black">Reduce turnaround time by 10 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preventive Measures */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Preventive Measures
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-black">Buffer Time</p>
                    <p className="text-xs text-black">Add 15-min buffer to peak slots</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-black">Resource Allocation</p>
                    <p className="text-xs text-black">Increase ground staff during peak hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CascadeRisk;