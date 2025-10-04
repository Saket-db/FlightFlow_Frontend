import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Target, Plane, Search, TrendingUp, TrendingDown, BarChart3, Clock } from "lucide-react";
import { apiService } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Predictions = () => {
  const [flightNumber, setFlightNumber] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");
  const [predictionData, setPredictionData] = useState<any>(null);
  const [whatIfData, setWhatIfData] = useState<any>(null);
  const [slotData, setSlotData] = useState<any[]>([]);
  const [airlineData, setAirlineData] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeShift, setTimeShift] = useState(15);
  const [slotMinutes, setSlotMinutes] = useState(1);
  const [availableFlights, setAvailableFlights] = useState<string[]>([]);

  // Sample data for charts (replace with real API data)
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
    { airline: "AI", avg_dep_delay: 8.5, flights: 45, p90_dep_delay: 18 },
    { airline: "QP", avg_dep_delay: 6.2, flights: 32, p90_dep_delay: 14 },
    { airline: "QO", avg_dep_delay: 9.1, flights: 28, p90_dep_delay: 20 },
    { airline: "OV", avg_dep_delay: 5.8, flights: 35, p90_dep_delay: 12 },
    { airline: "GF", avg_dep_delay: 7.3, flights: 42, p90_dep_delay: 16 },
  ];

  useEffect(() => {
    // Fetch data for charts
    const fetchData = async () => {
      try {
        const [slotsResponse, airlinesResponse, routesResponse, flightsResponse] = await Promise.all([
          apiService.getSlotStats(),
          apiService.getTopAirlines(),
          apiService.getTopRoutes(),
          apiService.getFlights()
        ]);
        
        if (slotsResponse.data) {
          setSlotData(slotsResponse.data);
        }
        
        if (airlinesResponse.data) {
          setAirlineData(airlinesResponse.data);
        }
        
        if (routesResponse.data) {
          setRouteData(routesResponse.data);
        }

        if (flightsResponse.data?.flights) {
          setAvailableFlights(flightsResponse.data.flights);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use sample data as fallback
        setSlotData(sampleSlotData);
        setAirlineData(sampleAirlineData);
        setAvailableFlights(['AI1001', 'AI1002', 'QP2001', 'QO3001', 'OV4001']);
      }
    };

    fetchData();
  }, []);

  const handleFlightPrediction = async () => {
    if (!selectedFlight) return;
    
    setLoading(true);
    try {
      const response = await apiService.predictDelays({
        flight: selectedFlight
      });
      // Convert backend response to frontend format
      setPredictionData({
        flight_id: response.data.flight,
        predicted_delay: response.data.p50,
        p90_delay: response.data.p90,
        delay_probability: response.data.delay_probability,
        confidence: response.data.confidence,
        sample_size: response.data.sample_size,
      });
    } catch (error) {
      console.error('Error predicting delays:', error);
      // Set sample prediction data as fallback
      setPredictionData({
        flight_id: selectedFlight,
        delay_probability: 0.65,
        predicted_delay: 12.5,
        confidence: 0.78,
        factors: ["Peak hour", "Weather conditions", "Route congestion"]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatIfAnalysis = async () => {
    if (!selectedFlight) return;
    
    setLoading(true);
    try {
      const response = await apiService.runWhatIfScenario({
        flight: selectedFlight,
        minutes: timeShift,
        slotMinutes: slotMinutes,
      });
      setWhatIfData(response.data);
    } catch (error) {
      console.error('Error running what-if analysis:', error);
      // Sample fallback mapped to backend-like shape
      setWhatIfData({
        flight: selectedFlight,
        minutes: timeShift,
        queueing_burden_before: 10,
        queueing_burden_after: 10 - timeShift * 0.1,
        delta: -timeShift * 0.1,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-black">Flight Predictions & Analytics</h1>
        <p className="text-black mt-1">
          AI-powered delay predictions, what-if scenario analysis, and comprehensive performance insights
        </p>
      </div>

      {/* Flight Selection and Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Brain className="h-5 w-5 text-primary" />
            Flight Delay Prediction
          </CardTitle>
          <CardDescription className="text-black">
            Select a flight to get AI-powered delay predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flightSelect" className="text-black">Select Flight</Label>
                <Select value={selectedFlight} onValueChange={setSelectedFlight}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a flight number" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFlights.map((flight) => (
                      <SelectItem key={flight} value={flight}>
                        {flight}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button id="predict-delays-btn" onClick={handleFlightPrediction} disabled={loading || !selectedFlight}>
                  <Search className="h-4 w-4 mr-2" />
                  Predict Delays
                </Button>
              </div>
            </div>

            {predictionData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-black">{predictionData.predicted_delay?.toFixed(1) || predictionData.p50 || 0} min</p>
                  <p className="text-sm text-black">Predicted Delay</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-black">{((predictionData.delay_probability || 0.5) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-black">Delay Probability</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-black">{((predictionData.confidence || 0.7) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-black">Confidence</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* What-If Scenario Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Target className="h-5 w-5 text-success" />
            What-If Scenario Analysis
          </CardTitle>
          <CardDescription className="text-black">
            Analyze the impact of schedule changes on delays and queue burden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="timeShift" className="text-black">Time Shift (minutes)</Label>
                <Select value={timeShift.toString()} onValueChange={(value) => setTimeShift(parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="slotMinutes" className="text-black">Bucket Granularity</Label>
                <Select value={slotMinutes.toString()} onValueChange={(v) => setSlotMinutes(parseInt(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button id="analyze-impact-btn" onClick={handleWhatIfAnalysis} disabled={loading || !selectedFlight}>
                Analyze Impact
              </Button>
            </div>

            {whatIfData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">{selectedFlight ? 1 : 0}</p>
                    <p className="text-sm text-black">Flights Affected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black flex items-center justify-center gap-1">
                      {whatIfData.delta > 0 ? (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      )}
                      {Math.abs(whatIfData.delta || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-black">Queue Burden Δ (min)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-black">{(whatIfData.queueing_burden_before ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-black">Queue Burden Before (min)</p>
                  </div>
                </div>

                {/* Friendly summary cards: totals in hours and avg per flight */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="col-span-2 text-center p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-600">Total Wait (before)</p>
                    <p className="text-xl font-bold text-black">{((whatIfData.stats_before?.total_wait ?? 0) / 60).toFixed(2)} h</p>
                    <p className="text-xs text-gray-500">({(whatIfData.stats_before?.total_wait ?? 0).toFixed(0)} min)</p>
                  </div>
                  <div className="col-span-2 text-center p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-600">Avg wait / flight (before)</p>
                    <p className="text-xl font-bold text-black">{(whatIfData.stats_before?.avg_wait_per_flight ?? 0).toFixed(2)} min</p>
                    <p className="text-xs text-gray-500">{whatIfData.stats_before?.total_flights ?? 0} flights</p>
                    {(whatIfData.stats_before?.median_wait_per_flight !== undefined) && (
                      <p className="text-xs text-gray-500">median: {(whatIfData.stats_before?.median_wait_per_flight ?? 0).toFixed(2)} min</p>
                    )}
                    {(whatIfData.stats_before?.avg_wait_per_unique_flight !== undefined) && (
                      <p className="text-xs text-gray-500">avg / unique flight: {(whatIfData.stats_before?.avg_wait_per_unique_flight ?? 0).toFixed(2)} min</p>
                    )}
                  </div>
                  <div className="col-span-2 text-center p-4 bg-white rounded-lg shadow">
                    <p className="text-sm text-gray-600">Total Wait Δ</p>
                    <p className="text-xl font-bold text-black">{(((whatIfData.stats_after?.total_wait ?? 0) - (whatIfData.stats_before?.total_wait ?? 0)) / 60).toFixed(2)} h</p>
                    <p className="text-xs text-gray-500">Δ {(whatIfData.delta ?? 0).toFixed(2)} min</p>
                    {(whatIfData.stats_after?.median_wait_per_flight !== undefined) && (
                      <p className="text-xs text-gray-500">median after: {(whatIfData.stats_after?.median_wait_per_flight ?? 0).toFixed(2)} min</p>
                    )}
                    {(whatIfData.stats_after?.avg_wait_per_unique_flight !== undefined) && (
                      <p className="text-xs text-gray-500">avg/unique after: {(whatIfData.stats_after?.avg_wait_per_unique_flight ?? 0).toFixed(2)} min</p>
                    )}
                  </div>
                </div>

                {/* Top slots before/after */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg shadow">
                    <h4 className="text-sm font-semibold text-gray-700">Top Slots — Before</h4>
                    <div className="mt-2 space-y-2">
                      {(whatIfData.stats_before?.top_slots || []).slice(0,3).map((s:any, i:number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <div>Slot {String(Math.floor((s.bucket||0)/60)).padStart(2,'0')}:{String((s.bucket||0)%60).padStart(2,'0')}</div>
                          <div>{s.count} flights — {(s.total_wait/60).toFixed(2)} h</div>
                        </div>
                      ))}
                      {(!whatIfData.stats_before || (whatIfData.stats_before.top_slots || []).length === 0) && (
                        <div className="text-sm text-gray-500">No slot data</div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg shadow">
                    <h4 className="text-sm font-semibold text-gray-700">Top Slots — After</h4>
                    <div className="mt-2 space-y-2">
                      {(whatIfData.stats_after?.top_slots || []).slice(0,3).map((s:any, i:number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <div>Slot {String(Math.floor((s.bucket||0)/60)).padStart(2,'0')}:{String((s.bucket||0)%60).padStart(2,'0')}</div>
                          <div>{s.count} flights — {(s.total_wait/60).toFixed(2)} h</div>
                        </div>
                      ))}
                      {(!whatIfData.stats_after || (whatIfData.stats_after.top_slots || []).length === 0) && (
                        <div className="text-sm text-gray-500">No slot data</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section - All from Tab2 */}
      <div className="space-y-6">
        {/* By Slot Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">By Slot Analysis</CardTitle>
            <CardDescription className="text-black">P90 and volume by 15-minute slot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* P90 Delay Line Chart */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4">P90 Departure Delay by Slot</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={slotData.length > 0 ? slotData : sampleSlotData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="slot_label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="p90_dep_delay" stroke="#dc2626" strokeWidth={2} name="P90 Delay" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Busiest Slots Bar Chart */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4">Busiest Slots (Top 20)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(slotData.length > 0 ? slotData : sampleSlotData).sort((a, b) => (b.flights || 0) - (a.flights || 0)).slice(0, 20)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="slot_label" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="flights" fill="#2563eb" name="Flights" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Airlines Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Airlines Analysis</CardTitle>
            <CardDescription className="text-black">Performance comparison by airline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Average Delay by Airline */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4">Average Departure Delay by Airline</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(airlineData.length > 0 ? airlineData : sampleAirlineData).slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="airline" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_dep_delay" fill="#2563eb" name="Avg Delay" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* P90 Delay by Airline */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4">P90 Departure Delay by Airline</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={(airlineData.length > 0 ? airlineData : sampleAirlineData).slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="airline" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="p90_dep_delay" fill="#dc2626" name="P90 Delay" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes Analysis */}
  
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Performance Insights</CardTitle>
          <CardDescription className="text-black">Key metrics and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-black">{slotData.length > 0 ? slotData.length : sampleSlotData.length}</p>
              <p className="text-sm text-black">Time Slots</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-black">
                {slotData.length > 0 
                  ? Math.round(slotData.reduce((sum, slot) => sum + (slot.flights || 0), 0) / slotData.length)
                  : Math.round(sampleSlotData.reduce((sum, slot) => sum + slot.flights, 0) / sampleSlotData.length)
                }
              </p>
              <p className="text-sm text-black">Avg Flights/Slot</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-black">
                {slotData.length > 0 
                  ? Math.round(slotData.reduce((sum, slot) => sum + (slot.avg_dep_delay || 0), 0) / slotData.length)
                  : Math.round(sampleSlotData.reduce((sum, slot) => sum + slot.p50_delay, 0) / sampleSlotData.length)
                }
              </p>
              <p className="text-sm text-black">Avg Delay (min)</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-black">
                {slotData.length > 0 
                  ? Math.round(slotData.reduce((sum, slot) => sum + (slot.p90_dep_delay || 0), 0) / slotData.length)
                  : Math.round(sampleSlotData.reduce((sum, slot) => sum + slot.p90_delay, 0) / sampleSlotData.length)
                }
              </p>
              <p className="text-sm text-black">P90 Delay (min)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Predictions;