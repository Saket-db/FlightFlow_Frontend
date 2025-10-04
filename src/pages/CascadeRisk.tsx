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
  const [computedTrend, setComputedTrend] = useState<any[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]); // empty = all
  const [page, setPage] = useState<number>(1);
  const perPage = 20;
  const [searchFlight, setSearchFlight] = useState<string>('');
  const [meta, setMeta] = useState<any>(null);

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
  // fallback trend data
  const riskTrendData = [
    { hour: 6, high_risk: 0, medium_risk: 1, low_risk: 2 },
    { hour: 7, high_risk: 2, medium_risk: 2, low_risk: 1 },
    { hour: 8, high_risk: 1, medium_risk: 1, low_risk: 3 },
    { hour: 9, high_risk: 0, medium_risk: 1, low_risk: 2 },
    { hour: 10, high_risk: 0, medium_risk: 0, low_risk: 1 },
  ];

  useEffect(() => {
    const fetchCascadeData = async () => {
      setLoading(true);
      try {
        const riskParam = selectedRisks.length ? selectedRisks.join(',') : undefined;
        const response = await apiService.getCascadeAnalysis({ risk: riskParam, page, per_page: perPage, flight: searchFlight || undefined });
        if (response && response.data) {
          const payload = response.data as any;
          const dataArr = Array.isArray(payload.records) ? payload.records : [];
          setCascadeData(dataArr as any[]);
          setMeta(payload.meta || null);

          // Calculate risk metrics from meta if available, else compute locally
          if (payload.meta && payload.meta.counts) {
            const counts = payload.meta.counts as Record<string, number>;
            const total = Object.values(counts).reduce((s, v) => s + v, 0);
            setRiskMetrics({
              total_flights: total,
              high_risk: counts['High'] || 0,
              medium_risk: counts['Medium'] || 0,
              low_risk: counts['Low'] || 0,
              total_affected: dataArr.reduce((sum: number, f: any) => sum + (f.affected_flights || f.affected || 0), 0),
              avg_cascade_impact: dataArr.length ? dataArr.reduce((sum: number, f: any) => sum + (f.cascade_impact || f.impact || 0), 0) / dataArr.length : 0
            });
          } else {
            const metrics = {
              total_flights: dataArr.length,
              high_risk: dataArr.filter((f: any) => (f.risk_level || f.risk || '').toString().toLowerCase() === "high").length,
              medium_risk: dataArr.filter((f: any) => (f.risk_level || f.risk || '').toString().toLowerCase() === "medium").length,
              low_risk: dataArr.filter((f: any) => (f.risk_level || f.risk || '').toString().toLowerCase() === "low").length,
              total_affected: dataArr.reduce((sum: number, f: any) => sum + (f.affected_flights || f.affected || 0), 0),
              avg_cascade_impact: dataArr.length ? dataArr.reduce((sum: number, f: any) => sum + (f.cascade_impact || f.impact || 0), 0) / dataArr.length : 0
            };
            setRiskMetrics(metrics);
          }

          // Compute trend map same as before
          const trendMap: Record<string, { high: number; medium: number; low: number }> = {};
          dataArr.forEach((f: any, idx: number) => {
            let hourKey = null as string | null;
            const st = f.scheduled_time || f.TimeSlot || f.time || '';
            if (typeof st === 'string') {
              const m = st.match(/(\d{1,2}):(\d{2})/);
              if (m) hourKey = String(parseInt(m[1], 10));
            }
            if (!hourKey) hourKey = String(6 + (idx % 12));
            trendMap[hourKey] = trendMap[hourKey] || { high: 0, medium: 0, low: 0 };
            const rl = (f.risk_level || f.risk || '').toString().toLowerCase();
            if (rl === 'high') trendMap[hourKey].high += 1;
            else if (rl === 'medium') trendMap[hourKey].medium += 1;
            else trendMap[hourKey].low += 1;
          });
          const computedTrend = Object.keys(trendMap).sort((a,b)=>Number(a)-Number(b)).map(k=>({
            hour: Number(k),
            high_risk: trendMap[k].high,
            medium_risk: trendMap[k].medium,
            low_risk: trendMap[k].low
          }));
          if (computedTrend.length) setComputedTrend(computedTrend);
        } else {
          setCascadeData(sampleCascadeData);
        }
      } catch (error) {
        console.error('Error fetching cascade data:', error);
        setCascadeData(sampleCascadeData);
      } finally {
        setLoading(false);
      }
    };

    fetchCascadeData();
  }, [selectedRisks, page, searchFlight]);

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

  // Use server-provided page (cascadeData is already paged)
  const pagedData = cascadeData;
  const totalPages = meta ? Math.max(1, Math.ceil((meta.total_aggregated_flights || 0) / perPage)) : 1;

  // metrics: prefer meta-based counts when available
  const metrics = meta ? {
    total_flights: meta.total_aggregated_flights || 0,
    high_risk: meta.counts?.High || 0,
    medium_risk: meta.counts?.Medium || 0,
    low_risk: meta.counts?.Low || 0,
    total_affected: cascadeData.reduce((sum: number, f: any) => sum + (f.affected_flights || f.affected || 0), 0),
    avg_cascade_impact: cascadeData.length ? cascadeData.reduce((sum: number, f: any) => sum + (f.cascade_impact || f.impact || 0), 0) / cascadeData.length : 0
  } : {
    total_flights: cascadeData.length,
    high_risk: cascadeData.filter((f: any) => (f.risk_level || f.risk || '').toString().toLowerCase() === 'high').length,
    medium_risk: cascadeData.filter((f: any) => (f.risk_level || f.risk || '').toString().toLowerCase() === 'medium').length,
    low_risk: cascadeData.filter((f: any) => (f.risk_level || f.risk || '').toString().toLowerCase() === 'low').length,
    total_affected: cascadeData.reduce((sum: number, f: any) => sum + (f.affected_flights || f.affected || 0), 0),
    avg_cascade_impact: cascadeData.length ? cascadeData.reduce((sum: number, f: any) => sum + (f.cascade_impact || f.impact || 0), 0) / cascadeData.length : 0
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
            <div className="text-2xl font-bold text-black">{metrics.total_flights || 0}</div>
            <p className="text-xs text-black">Monitored flights</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.high_risk || 0}</div>
            <p className="text-xs text-black">Critical delays</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Affected Flights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{metrics.total_affected || 0}</div>
            <p className="text-xs text-black">Downstream impact</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-black">Avg Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {metrics.avg_cascade_impact ? Math.round(metrics.avg_cascade_impact) : 0} min
            </div>
            <p className="text-xs text-black">Cascade delay</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Filters</CardTitle>
          <CardDescription className="text-black">Select risk levels to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input placeholder="Search flight (e.g. 6E762)" value={searchFlight} onChange={(e)=>{ setSearchFlight(e.target.value); setPage(1); }} className="px-2 py-1 border rounded" />
            <button className="px-3 py-1 border rounded" onClick={()=>{ setPage(1); /* triggers effect */ }}>Search</button>
          </div>
          <div className="mt-3 flex gap-4">
            {['High','Medium','Low'].map(l => (
              <label key={l} className="inline-flex items-center gap-2">
                <input type="checkbox" value={l} checked={selectedRisks.includes(l)} onChange={(e)=>{
                  const checked = e.target.checked;
                  if (checked) {
                    setSelectedRisks(prev=> Array.from(new Set([...prev, l])));
                  } else {
                    setSelectedRisks(prev=> prev.filter(x=>x!==l));
                  }
                  setPage(1);
                }} />
                <span className="text-sm text-black">{l}</span>
              </label>
            ))}
            <button className="ml-4 px-3 py-1 border rounded" onClick={()=>{ setSelectedRisks([]); setPage(1); }}>Show All</button>
          </div>
        </CardContent>
      </Card>

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
            <LineChart data={computedTrend.length ? computedTrend : riskTrendData}>
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
            {pagedData.map((flight, index) => (
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-black">Showing {meta ? Math.min(meta.total_aggregated_flights, (page-1)*perPage+1) : (cascadeData.length?1:0)} - {meta ? Math.min(meta.total_aggregated_flights, page*perPage) : cascadeData.length} of {meta ? meta.total_aggregated_flights : cascadeData.length}</div>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <span className="text-sm">Page {page} / {totalPages}</span>
          <button className="px-3 py-1 border rounded" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
        </div>
      </div>

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