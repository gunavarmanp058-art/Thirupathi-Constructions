import { useState, useEffect } from "react";
import { MessageSquare, Phone, Mail, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const companyManagers = [
  { name: "R. Senthil Kumar", role: "Sr. Project Manager", phone: "+91 98765 43210", email: "senthil@tnconstruction.in" },
  { name: "P. Murugan", role: "Operations Head", phone: "+91 98765 43211", email: "murugan@tnconstruction.in" },
];

export default function ClientContact() {
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/client/projects");
        setProjects(res.data.data);
      } catch (error) {
        console.error("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/client/tickets", {
        project_id: projectId ? parseInt(projectId) : null,
        message: message,
        priority: 'MEDIUM'
      });
      toast({ title: "Query Submitted", description: "Your query has been recorded and assigned." });
      setMessage("");
      setProjectId("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit query", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Contact & Support</h1>
        <p className="text-sm text-muted-foreground mt-1">Reach out to our team or raise a query related to your projects.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Project Managers */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Key Contacts</h2>
          {companyManagers.map((mgr) => (
            <Card key={mgr.name}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{mgr.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{mgr.role}</p>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {mgr.phone}
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" /> {mgr.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Raise a query */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Raise a Query
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Related Project (Optional)</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your query or issue..."
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Query"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
