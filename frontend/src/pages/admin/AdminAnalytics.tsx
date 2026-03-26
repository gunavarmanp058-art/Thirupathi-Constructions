import { useState, useEffect } from "react";
import {
  BarChart3,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  FolderKanban,
  Wrench,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import api from "@/lib/axios";

export default function AdminAnalytics() {
  const [data, setData] = useState<{ projects: any[], machines: any[] }>({ projects: [], machines: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/analytics");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getHealthClass = (health: string) => {
    if (health === 'High Risk' || health === 'Critical') return 'status-critical';
    if (health === 'Slight Delay' || health === 'Needs Maintenance') return 'status-warning';
    return 'status-good';
  };

  const generatePDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("AI Analytics Audit Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });

    // Project Section
    doc.setFontSize(16);
    doc.text("Project Risk Analysis", 20, 45);
    doc.setLineWidth(0.1);
    doc.line(20, 47, 190, 47);

    let y = 55;
    data.projects.forEach((p) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(p.name, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Progress: ${p.progress || 0}% | Risk: ${p.ai.risk} | Delay: ${p.ai.shift_days} days`, 20, y + 5);
      y += 15;
    });

    // Machine Section
    if (y > 200) { doc.addPage(); y = 20; } else { y += 10; }

    doc.setFontSize(16);
    doc.text("Machinery Health Audit", 20, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;

    data.machines.forEach((m) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(m.name, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(`Condition: ${m.ai.condition}`, 20, y + 5);
      const rec = doc.splitTextToSize(`Recommendation: ${m.ai.recommendation}`, 160);
      doc.text(rec, 20, y + 10);
      y += 15 + (rec.length * 5);
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save("AI_Audit_Report.pdf");
  };

  const chartData = data.projects.map(p => ({
    name: p.name.substring(0, 15) + '...',
    progress: p.progress || 0
  }));

  if (loading) {
    return <div className="p-12 flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Initializing AI Analysis Engines...</p>
    </div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">AI & Analytics</h1>
            <p className="text-sm text-muted-foreground">Live AI predictions for projects and machinery maintenance.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => generatePDF()} className="gap-2 shrink-0">
          <Clock className="h-4 w-4" /> Download Audit Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Project Completion Progress (%)</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.progress > 80 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Tabs defaultValue="projects">
            <TabsList>
              <TabsTrigger value="projects" className="gap-1 px-4">
                <TrendingUp className="h-3.5 w-3.5" /> Project Predictions
              </TabsTrigger>
              <TabsTrigger value="machinery" className="gap-1 px-4">
                <Wrench className="h-3.5 w-3.5" /> Machine Health
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-4 space-y-4">
              {data.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <Badge className={getHealthClass(project.ai.health)} variant="outline">{project.ai.health}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">AI Risk Level</p>
                        <p className={`font-bold ${project.ai.risk === 'High' ? 'text-destructive' : 'text-primary'}`}>
                          {project.ai.risk}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Est. Delay</p>
                        <p className="text-foreground font-medium">{project.ai.shift_days} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">AI Engine</p>
                        <p className="text-xs text-muted-foreground italic font-mono">{project.ai.source}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border flex items-center gap-3">
                      <Brain className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-xs text-foreground">
                        AI identifies <strong>{project.ai.risk} risk</strong> based on current deviation from {project.progress}% progress.
                        Target completion is potentially shifted by {project.ai.shift_days} days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="machinery" className="mt-4 space-y-4">
              {data.machines.map((machine) => (
                <Card key={machine.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{machine.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{machine.model} • {machine.logs.working_hours || 0}h logged</p>
                      </div>
                      <Badge className={getHealthClass(machine.ai.condition)} variant="outline">{machine.ai.condition}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                        <Brain className="h-3 w-3" /> AI Recommendation
                      </p>
                      <p className="text-sm text-foreground">{machine.ai.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">AI Fleet Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{data.machines.filter(m => m.ai.condition === 'Good').length}</p>
                    <p className="text-xs opacity-80">Operational</p>
                  </div>
                  <CheckCircle className="h-8 w-8 opacity-20" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold">{data.machines.filter(m => m.ai.condition !== 'Good' && m.ai.condition !== 'Unknown').length}</p>
                    <p className="text-xs opacity-80">Service Req.</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Project Reliability</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.projects.slice(0, 3).map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{p.name}</span>
                      <span className={p.ai.risk === 'Low' ? 'text-primary' : 'text-destructive'}>
                        {p.ai.risk === 'Low' ? 'Safe' : 'Delayed'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${p.ai.risk === 'Low' ? 'bg-primary' : 'bg-destructive'}`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
