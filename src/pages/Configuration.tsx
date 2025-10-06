import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Plane, Gauge, Clock, AlertTriangle, CheckCircle, Save, RefreshCw } from "lucide-react";
import { apiService } from "@/services/api";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface RunwayConfig {
  mode: string;
  weather: string;
  capacity: number;
  buffer_time: number;
  peak_hours: string[];
  maintenance_slots: string[];
}

interface SystemConfig {
  auto_scheduling: boolean;
  delay_threshold: number;
  cascade_monitoring: boolean;
  weather_integration: boolean;
  notification_enabled: boolean;
}

const Configuration = () => {
  const [runwayConfig, setRunwayConfig] = useState<RunwayConfig>({
    mode: "Normal",
    weather: "VMC",
    capacity: 24,
    buffer_time: 15,
    peak_hours: ["07:00", "08:00", "17:00", "18:00"],
    maintenance_slots: ["02:00", "03:00"]
  });
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    auto_scheduling: true,
    delay_threshold: 15,
    cascade_monitoring: true,
    weather_integration: true,
    notification_enabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [systemMetrics, setSystemMetrics] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch configuration and system metrics. Separated so we can re-run without a full page reload.
  const fetchConfiguration = async () => {
    try {
      setErrorMessage(null);
      setLoading(true);
      // Fetch runway configuration
      const runwayResponse = await apiService.getRunwayConfig();
      if (runwayResponse?.data && typeof runwayResponse.data === 'object') {
        // Only copy expected fields to avoid replacing state with unexpected shapes
        setRunwayConfig(prev => ({
          mode: runwayResponse.data.mode ?? prev.mode,
          weather: runwayResponse.data.weather ?? prev.weather,
          capacity: runwayResponse.data.capacity ?? prev.capacity,
          buffer_time: runwayResponse.data.buffer_time ?? prev.buffer_time,
          peak_hours: runwayResponse.data.peak_hours ?? prev.peak_hours,
          maintenance_slots: runwayResponse.data.maintenance_slots ?? prev.maintenance_slots,
        }));
      }

      // Fetch system metrics (dataset metadata) and normalize keys from backend
      const metaResponse = await apiService.getDatasetMeta();
      if (metaResponse?.data && typeof metaResponse.data === 'object') {
        const meta = metaResponse.data;
        const totalFlights = (meta as any).rows ?? meta.total_flights ?? 0;
        // airports: try explicit list, else fallback to unique keys in from_top / to_top
        const airportsCount = Array.isArray(meta.airports)
          ? meta.airports.length
          : (meta as any).from_top
          ? Object.keys((meta as any).from_top).length
          : 0;
        const airlinesCount = Array.isArray((meta as any).airlines)
          ? (meta as any).airlines.length
          : (meta as any).airlines
          ? Object.keys((meta as any).airlines).length
          : 0;

        setSystemMetrics({
          total_flights: totalFlights,
          date_range: meta.date_range ?? null,
          airports: airportsCount,
          airlines: airlinesCount,
        });
      }
    } catch (error: any) {
      console.error('Error fetching configuration:', error);
      setErrorMessage(error?.message ?? 'Failed to fetch configuration');
      // Keep existing defaults on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguration();
    // run only on mount
  }, []);

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setSaveStatus("saving");
    
    try {
      // Send runway configuration to backend
      const payload = {
        mode: runwayConfig.mode,
        weather: runwayConfig.weather,
        capacity: runwayConfig.capacity,
        buffer_time: runwayConfig.buffer_time,
        peak_hours: runwayConfig.peak_hours,
        maintenance_slots: runwayConfig.maintenance_slots,
      };
      const runwayResponse = await apiService.updateRunwayConfig(payload);
      if (runwayResponse?.data) {
        setSaveStatus("saved");
        // Re-fetch server-side config so UI reflects any server adjustments
        await fetchConfiguration();
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        throw new Error('Failed to save runway config');
      }
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      setErrorMessage(error?.message ?? 'Failed to save configuration');
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  const calculateCapacity = () => {
    const baseCapacity = runwayConfig.capacity;
    const weatherMultiplier = runwayConfig.weather === "VMC" ? 1.0 : 0.7;
    const bufferMultiplier = 1 - (runwayConfig.buffer_time / 60);
    return Math.round(baseCapacity * weatherMultiplier * bufferMultiplier);
  };

  const getWeatherColor = (weather: string) => {
    switch (weather) {
      case "VMC": return "bg-green-100 text-green-800";
      case "IMC": return "bg-amber-100 text-amber-800";
      case "Severe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "Normal": return "bg-blue-100 text-blue-800";
      case "Peak": return "bg-orange-100 text-orange-800";
      case "Reduced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">System Configuration</h1>
          <p className="text-black mt-1">
            Configure runway settings, system parameters, and operational preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchConfiguration()} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={handleSaveConfiguration} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {/* Save Status */}
      {saveStatus !== "idle" && (
        <div className={`p-4 rounded-lg ${
          saveStatus === "saved" ? "bg-green-50 border border-green-200" :
          saveStatus === "error" ? "bg-red-50 border border-red-200" :
          "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === "saved" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : saveStatus === "error" ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <Clock className="h-5 w-5 text-blue-600" />
            )}
            <span className="text-black">
              {saveStatus === "saved" ? "Configuration saved successfully!" :
               saveStatus === "error" ? "Error saving configuration. Please try again." :
               "Saving configuration..."}
            </span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{systemMetrics.total_flights || 0}</div>
            <p className="text-xs text-black">In system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Active Airports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{systemMetrics.airports || 0}</div>
            <p className="text-xs text-black">Operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Airlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{systemMetrics.airlines || 0}</div>
            <p className="text-xs text-black">Operating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Effective Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{calculateCapacity()}/hr</div>
            <p className="text-xs text-black">Current rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runway Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Plane className="h-5 w-5 text-primary" />
              Runway Configuration
            </CardTitle>
            <CardDescription className="text-black">
              Configure runway operational parameters and capacity settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <Badge className={getModeColor(runwayConfig.mode)}>
                  {runwayConfig.mode} Mode
                </Badge>
                <p className="text-xs text-black mt-1">Operation Mode</p>
              </div>
              <div className="text-center">
                <Badge className={getWeatherColor(runwayConfig.weather)}>
                  {runwayConfig.weather}
                </Badge>
                <p className="text-xs text-black mt-1">Weather Condition</p>
              </div>
            </div>

            {/* Configuration Controls */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="mode" className="text-black">Operation Mode</Label>
                <Select value={runwayConfig.mode} onValueChange={(value) => setRunwayConfig(prev => ({ ...prev, mode: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Peak">Peak Hours</SelectItem>
                    <SelectItem value="Reduced">Reduced Capacity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weather" className="text-black">Weather Condition</Label>
                <Select value={runwayConfig.weather} onValueChange={(value) => setRunwayConfig(prev => ({ ...prev, weather: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VMC">VMC (Visual)</SelectItem>
                    <SelectItem value="IMC">IMC (Instrument)</SelectItem>
                    <SelectItem value="Severe">Severe Weather</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity" className="text-black">Base Capacity (flights/hour)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={runwayConfig.capacity}
                  onChange={(e) => setRunwayConfig(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  className="mt-1"
                  min="10"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="buffer" className="text-black">Buffer Time (minutes)</Label>
                <Input
                  id="buffer"
                  type="number"
                  value={runwayConfig.buffer_time}
                  onChange={(e) => setRunwayConfig(prev => ({ ...prev, buffer_time: parseInt(e.target.value) }))}
                  className="mt-1"
                  min="0"
                  max="60"
                />
              </div>
            </div>

            {/* Peak Hours */}
            <div>
              <Label className="text-black">Peak Hours</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {runwayConfig.peak_hours.map((hour, index) => (
                  <Input
                    key={index}
                    type="time"
                    value={hour}
                    onChange={(e) => {
                      const newHours = [...runwayConfig.peak_hours];
                      newHours[index] = e.target.value;
                      setRunwayConfig(prev => ({ ...prev, peak_hours: newHours }));
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Settings className="h-5 w-5 text-success" />
              System Settings
            </CardTitle>
            <CardDescription className="text-black">
              Configure system behavior and automation features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toggle Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Auto Scheduling</Label>
                  <p className="text-xs text-black">Automatically optimize flight schedules</p>
                </div>
                <Switch
                  checked={systemConfig.auto_scheduling}
                  onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, auto_scheduling: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Cascade Monitoring</Label>
                  <p className="text-xs text-black">Monitor delay cascade effects</p>
                </div>
                <Switch
                  checked={systemConfig.cascade_monitoring}
                  onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, cascade_monitoring: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Weather Integration</Label>
                  <p className="text-xs text-black">Integrate weather data for planning</p>
                </div>
                <Switch
                  checked={systemConfig.weather_integration}
                  onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, weather_integration: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Notifications</Label>
                  <p className="text-xs text-black">Enable system notifications</p>
                </div>
                <Switch
                  checked={systemConfig.notification_enabled}
                  onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, notification_enabled: checked }))}
                />
              </div>
            </div>

            {/* Delay Threshold */}
            <div>
              <Label htmlFor="threshold" className="text-black">Delay Threshold (minutes)</Label>
              <Input
                id="threshold"
                type="number"
                value={systemConfig.delay_threshold}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, delay_threshold: parseInt(e.target.value) }))}
                className="mt-1"
                min="5"
                max="60"
              />
              <p className="text-xs text-black mt-1">Flights exceeding this delay will trigger alerts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Gauge className="h-5 w-5 text-amber-600" />
            Operational Parameters
          </CardTitle>
          <CardDescription className="text-black">
            Current operational metrics and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Capacity Analysis */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-black mb-2">Capacity Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-black">Base Capacity:</span>
                  <span className="text-sm font-medium text-black">{runwayConfig.capacity}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Weather Factor:</span>
                  <span className="text-sm font-medium text-black">
                    {runwayConfig.weather === "VMC" ? "100%" : runwayConfig.weather === "IMC" ? "70%" : "50%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Buffer Impact:</span>
                  <span className="text-sm font-medium text-black">
                    -{Math.round((runwayConfig.buffer_time / 60) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium text-black">Effective Capacity:</span>
                  <span className="text-sm font-bold text-blue-600">{calculateCapacity()}/hr</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-black mb-2">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-black">Utilization:</span>
                  <span className="text-sm font-medium text-black">
                    {Math.round((systemMetrics.total_flights || 0) / (calculateCapacity() * 24) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Efficiency:</span>
                  <span className="text-sm font-medium text-black">
                    {runwayConfig.mode === "Normal" ? "85%" : runwayConfig.mode === "Peak" ? "95%" : "70%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Reliability:</span>
                  <span className="text-sm font-medium text-black">
                    {runwayConfig.weather === "VMC" ? "98%" : "85%"}
                  </span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-black mb-2">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemConfig.auto_scheduling ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className="text-sm text-black">Auto Scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemConfig.cascade_monitoring ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className="text-sm text-black">Cascade Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemConfig.weather_integration ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className="text-sm text-black">Weather Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    systemConfig.notification_enabled ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className="text-sm text-black">Notifications</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuration;