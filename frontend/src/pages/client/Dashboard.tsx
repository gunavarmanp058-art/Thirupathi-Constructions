import { Link } from "react-router-dom";
import {
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Truck,
  Activity,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";

// Placeholder for recent activity until we have an endpoint
const recentActivity = [
  { text: "Weekly progress uploaded for Madurai Urban Road", time: "2 hours ago", icon: Activity },
  { text: "AI report generated for Trichy Water Network", time: "1 day ago", icon: TrendingUp },
  { text: "Machine JCB-04 maintenance completed", time: "2 days ago", icon: CheckCircle },
  { text: "New milestone reached: ECR Road Phase 1", time: "3 days ago", icon: FolderKanban },
];

export default function ClientDashboard() {
  const { data: dashboardData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: async () => {
      const response = await api.get("/client/dashboard");
      return response.data.data;
    },
  });

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["client-projects"],
    queryFn: async () => {
      const response = await api.get("/client/projects");
      return response.data.data;
    },
  });

  const stats = [
    {
      title: "Assigned Projects",
      value: dashboardData?.assignedProjects || "0",
      icon: FolderKanban,
      change: "Active",
      color: "text-primary"
    },
    {
      title: "Open Tickets",
      value: dashboardData?.openTickets || "0",
      icon: AlertTriangle,
      change: "Needs attention",
      color: parseInt(dashboardData?.openTickets) > 0 ? "text-warning-foreground" : "text-primary"
    },
    {
      title: "Assigned Machines",
      value: dashboardData?.assignedMachines || "0",
      icon: Truck,
      change: "Operational",
      color: "text-primary"
    },
    // Placeholder for health until we fetch it properly
    { title: "System Status", value: "Good", icon: CheckCircle, change: "All systems go", color: "text-primary" },
  ];

  const recentProjects = projectsData ? projectsData.slice(0, 3) : [];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'status-good';
      case 'ON_HOLD': return 'status-warning';
      case 'ONGOING': return 'bg-blue-100 text-blue-800'; // Custom or existing
      default: return 'status-neutral';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Welcome back, Client</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's an overview of your projects and activity.</p>
        </div>
        <Button variant="outline" size="sm" asChild className="hidden md:flex">
          <Link to="/">View Public Site</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">
                {isStatsLoading ? "..." : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Projects overview */}
        <div className="lg:col-span-2 xl:col-span-3 min-w-0">
          <Card className="border-muted shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
              <CardTitle className="text-lg font-display">Active Projects</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client/projects" className="gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {isProjectsLoading ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-sm">Fetching project status...</p>
                  </div>
                ) : recentProjects.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground italic flex flex-col items-center gap-2">
                    <FolderKanban className="h-8 w-8 opacity-20" />
                    <p>No projects currently assigned to your account.</p>
                  </div>
                ) : (
                  recentProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center gap-4 p-4 lg:p-6 hover:bg-muted/30 transition-colors group">
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">{project.name}</p>
                            <Badge className={cn(getStatusClass(project.status), "text-[10px] uppercase tracking-wide")} variant="outline">
                              {project.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium whitespace-nowrap hidden sm:flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(project.expected_end).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs mb-1">
                             <span className="text-muted-foreground font-medium">Completion Progress</span>
                             <span className="text-primary font-bold tabular-nums">
                              {Math.round(Math.min(100, project.progress || 0))}%
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden transition-all group-hover:h-2.5">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min(100, project.progress || 0)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild className="shrink-0 group-hover:translate-x-1 transition-transform">
                        <Link to={`/client/projects/${project.id}`}>
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
          <div className="flex items-center gap-2 mb-4">
             <Activity className="h-4 w-4 text-primary" />
             <h3 className="font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="space-y-6">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex gap-3 group">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-snug">{item.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
