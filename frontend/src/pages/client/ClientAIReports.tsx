import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateAIReportPDF } from "@/lib/generateAIReportPDF";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function ClientAIReports() {
  const { toast } = useToast();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["client-ai-reports"],
    queryFn: async () => {
      const response = await api.get("/client/ai-reports");
      return response.data.data;
    },
  });

  const projectHealth = reportsData || [];

  // Derived stats
  const healthyCount = projectHealth.filter((p: any) => p.health === 'Good' || p.health === 'On Track').length;
  const riskCount = projectHealth.filter((p: any) => p.health === 'High Risk' || p.health === 'At Risk' || p.health === 'Slight Delay').length;
  const avgProgress = projectHealth.length > 0
    ? Math.round(projectHealth.reduce((acc: number, curr: any) => acc + parseFloat(curr.progress || 0), 0) / projectHealth.length)
    : 0;

  const downloadPDF = (projectName?: string) => {
    let projects = projectName
      ? projectHealth.filter((p: any) => p.name === projectName)
      : projectHealth;

    // Format dates for PDF display
    projects = projects.map((p: any) => ({
      ...p,
      completionPrediction: new Date(p.completionPrediction).toLocaleDateString()
    }));

    generateAIReportPDF(projects, !!projectName);

    toast({
      title: "PDF Report Downloaded",
      description: projectName
        ? `AI report for "${projectName}" has been downloaded.`
        : "Full AI report for all projects has been downloaded.",
    });
  };

  const getHealthClass = (health: string) => {
    if (health === 'High Risk') return 'status-destructive'; // Assuming this class exists or needs Tailwind equivalent
    if (health === 'Slight Delay') return 'status-warning';
    return 'status-good';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'High') return 'text-destructive';
    if (risk === 'Medium') return 'text-warning-foreground';
    return 'text-primary';
  };

  if (isLoading) {
    return <div className="p-6">Loading AI Reports...</div>;
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">AI Reports</h1>
            <p className="text-sm text-muted-foreground">AI-powered insights on your project health and predictions.</p>
          </div>
        </div>
        <Button onClick={() => downloadPDF()} className="gap-2" disabled={projectHealth.length === 0}>
          <FileText className="h-4 w-4" />
          Download All (PDF)
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{healthyCount}</p>
            <p className="text-xs text-muted-foreground">Healthy Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-warning-foreground mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{riskCount}</p>
            <p className="text-xs text-muted-foreground">At Risk / Delayed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold">{avgProgress}%</p>
            <p className="text-xs text-muted-foreground">Avg Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Project reports */}
      <div className="space-y-4">
        {projectHealth.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No AI reports available.</p>
        ) : (
          projectHealth.map((project: any) => (
            <Card key={project.id || project.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => downloadPDF(project.name)}
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </Button>
                    <Badge className={getHealthClass(project.health)} variant="outline">{project.health}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Completion Prediction</p>
                    <p className="flex items-center gap-1 text-foreground">
                      <Clock className="h-3 w-3" />
                      {/* Format date if needed, assuming backend sends ISO or similar */}
                      {new Date(project.completionPrediction).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Delay Risk</p>
                    <p className={`font-medium ${getRiskColor(project.delayRisk)}`}>{project.delayRisk}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium text-primary">{project.progress}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    AI Insight
                  </p>
                  <p className="text-sm text-foreground">{project.aiInsight}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
