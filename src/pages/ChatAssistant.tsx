import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, Plane } from "lucide-react";

const ChatAssistant = () => {
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Chat Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Natural language queries for flight operations and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Chat Interface
            </CardTitle>
            <CardDescription>Ask questions about flight operations in natural language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chat Assistant Coming Soon</h3>
              <p className="text-muted-foreground">
                Intelligent conversation interface for querying flight data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatAssistant;