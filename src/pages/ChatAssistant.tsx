import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, Plane, TrendingUp, AlertTriangle, Clock, Route, Send } from "lucide-react";
import { apiService } from "@/services/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDest, setSelectedDest] = useState("");
  const [topN, setTopN] = useState(10);
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI Ops Copilot. Ask me about flight operations, delays, or use the quick action buttons below.",
        timestamp: new Date()
      }
    ]);

    // Fetch available origins and destinations
    const fetchLocations = async () => {
      try {
        const metaResponse = await apiService.getDatasetMeta();
        if (metaResponse.data?.from_top) {
          setAvailableOrigins(Object.keys(metaResponse.data.from_top));
        }
        if (metaResponse.data?.to_top) {
          setAvailableDestinations(Object.keys(metaResponse.data.to_top));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Set sample data
        setAvailableOrigins(["MUMBAI (BOM)", "DELHI (DEL)", "BENGALURU (BLR)"]);
        setAvailableDestinations(["DELHI (DEL)", "BENGALURU (BLR)", "HYDERABAD (HYD)"]);
      }
    };

    fetchLocations();
  }, []);

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleQuickAction = async (action: string) => {
    setLoading(true);
    addMessage("user", action);
    
    try {
      let response = "";
      
      switch (action) {
        case "busiest":
          response = "Here are the busiest time slots:\n\n" +
                    "• 07:00-07:15: 15 flights (avg delay: 11 min)\n" +
                    "• 07:30-07:45: 15 flights (avg delay: 11 min)\n" +
                    "• 06:30-06:45: 10 flights (avg delay: 7 min)\n" +
                    "• 06:00-06:15: 8 flights (avg delay: 5 min)\n" +
                    "• 06:45-07:00: 7 flights (avg delay: 4 min)";
          break;
          
        case "best":
          response = "Here are the best (green) time slots:\n\n" +
                    "• 06:15-06:30: 6 flights (avg delay: 3 min)\n" +
                    "• 06:45-07:00: 7 flights (avg delay: 4 min)\n" +
                    "• 06:00-06:15: 8 flights (avg delay: 5 min)\n" +
                    "• 07:15-07:30: 9 flights (avg delay: 6 min)\n" +
                    "• 07:30-07:45: 15 flights (avg delay: 11 min)";
          break;
          
        case "cascade":
          response = "Cascade Risk Analysis:\n\n" +
                    "🚨 High Risk Flights:\n" +
                    "• AI1001: 22 min delay, affecting 3 downstream flights\n" +
                    "• QP2001: 18 min delay, affecting 2 downstream flights\n\n" +
                    "⚠️ Medium Risk:\n" +
                    "• QO3001: 15 min delay, affecting 1 downstream flight\n\n" +
                    "✅ Low Risk:\n" +
                    "• Most flights operating within normal parameters";
          break;
          
        default:
          response = "I can help with:\n" +
                    "• 'busiest' - Show busiest time slots\n" +
                    "• 'best' - Show best (green) time slots\n" +
                    "• 'cascade' - Show cascade risk analysis\n" +
                    "• Route analysis (use the route selector below)\n" +
                    "• General questions about flight operations";
      }
      
      addMessage("assistant", response);
    } catch (error) {
      addMessage("assistant", "Sorry, I encountered an error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteAnalysis = async (type: "best" | "worst") => {
    if (!selectedOrigin || !selectedDest) {
      addMessage("assistant", "Please select both origin and destination first.");
      return;
    }

    setLoading(true);
    const prompt = `${type} flights on ${selectedOrigin}->${selectedDest} top ${topN}`;
    addMessage("user", prompt);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = "";
      if (type === "best") {
        response = `Best flights on ${selectedOrigin} → ${selectedDest} (Top ${topN}):\n\n` +
                  "1. AI1001: Avg delay 3.2 min, 15 flights\n" +
                  "2. QP2001: Avg delay 4.1 min, 12 flights\n" +
                  "3. QO3001: Avg delay 5.8 min, 10 flights\n" +
                  "4. OV4001: Avg delay 6.2 min, 8 flights\n" +
                  "5. GF5001: Avg delay 7.1 min, 6 flights";
      } else {
        response = `Worst flights on ${selectedOrigin} → ${selectedDest} (Top ${topN}):\n\n` +
                  "1. AI1005: Avg delay 18.5 min, 8 flights\n" +
                  "2. QP2005: Avg delay 16.2 min, 6 flights\n" +
                  "3. QO3005: Avg delay 14.8 min, 5 flights\n" +
                  "4. OV4005: Avg delay 13.1 min, 4 flights\n" +
                  "5. GF5005: Avg delay 11.9 min, 3 flights";
      }
      
      addMessage("assistant", response);
    } catch (error) {
      addMessage("assistant", "Sorry, I encountered an error analyzing the route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage("user", userMessage);
    setLoading(true);
    
    try {
      // Simulate API call to chat endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = "";
      if (userMessage.toLowerCase().includes("delay")) {
        response = "I can help you analyze delays! Try asking about:\n" +
                  "• 'Show me delays for AI1001'\n" +
                  "• 'What are the average delays today?'\n" +
                  "• 'Which slots have the highest delays?'";
      } else if (userMessage.toLowerCase().includes("weather")) {
        response = "Weather conditions can significantly impact flight operations:\n\n" +
                  "🌤️ Current: VMC (Visual Meteorological Conditions)\n" +
                  "🌡️ Temperature: 28°C\n" +
                  "💨 Wind: 12 knots from NW\n" +
                  "☁️ Visibility: 10+ km\n\n" +
                  "Operations are currently normal with no weather-related delays.";
      } else if (userMessage.toLowerCase().includes("capacity")) {
        response = "Current runway capacity analysis:\n\n" +
                  "🛫 Departures: 24/hour (normal)\n" +
                  "🛬 Arrivals: 22/hour (normal)\n" +
                  "⚡ Peak utilization: 87%\n" +
                  "🟢 Green windows: 6 available\n" +
                  "🔴 Congested slots: 2 (07:00-07:30)";
      } else {
        response = "I understand you're asking about '" + userMessage + "'. " +
                  "I can help with flight operations, delays, routes, weather, and capacity analysis. " +
                  "Try asking something more specific or use the quick action buttons above.";
      }
      
      addMessage("assistant", response);
    } catch (error) {
      addMessage("assistant", "Sorry, I encountered an error processing your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-black">AI Ops Copilot</h1>
        <p className="text-black mt-1">
          Natural language interface for flight operations analysis
        </p>
      </div>

      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Quick Actions</CardTitle>
          <CardDescription className="text-black">
            Click these buttons for instant analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => handleQuickAction("busiest")} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm">Busiest</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickAction("best")} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Clock className="h-5 w-5" />
              <span className="text-sm">Best Slots</span>
            </Button>
            
            <Button 
              onClick={() => handleQuickAction("cascade")} 
              disabled={loading}
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Cascade Risk</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-blue-50"
            >
              <Plane className="h-5 w-5" />
              <span className="text-sm">System Status</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Route Ranking Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Route Ranking Tool</CardTitle>
          <CardDescription className="text-black">
            Analyze performance of specific routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-black">From</label>
              <select 
                value={selectedOrigin} 
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select Origin</option>
                {availableOrigins.map((origin) => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-black">To</label>
              <select 
                value={selectedDest} 
                onChange={(e) => setSelectedDest(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select Destination</option>
                {availableDestinations.map((dest) => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-black">Top N</label>
              <select 
                value={topN} 
                onChange={(e) => setTopN(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={15}>Top 15</option>
                <option value={20}>Top 20</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => handleRouteAnalysis("best")} 
                disabled={loading || !selectedOrigin || !selectedDest}
                variant="outline"
                className="w-full"
              >
                Best on Route
              </Button>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => handleRouteAnalysis("worst")} 
                disabled={loading || !selectedOrigin || !selectedDest}
                variant="outline"
                className="w-full"
              >
                Worst on Route
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <MessageSquare className="h-5 w-5 text-primary" />
            Chat Interface
          </CardTitle>
          <CardDescription className="text-black">
            Ask questions about flight operations in natural language
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-black border'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-black border p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about flight schedules... (e.g., 'busiest', 'predict delay for AI2509', 'best flights on BOM-DEL')"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Example Queries */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-black mb-2">Example Queries:</p>
            <div className="text-xs text-black space-y-1">
              <p>• <strong>Traffic Analysis:</strong> "busiest", "best", "cascade"</p>
              <p>• <strong>Specific Flight:</strong> "predict delay for AI2509", "shift AI2509 by 15 min"</p>
              <p>• <strong>Route Analysis:</strong> "best flights on BOM-DEL top 5"</p>
              <p>• <strong>General:</strong> "weather impact", "runway capacity", "delay trends"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatAssistant;