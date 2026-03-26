import { Link } from "react-router-dom";
import {
  FolderKanban,
  Truck,
  Users,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  User,
  Brain,
  Zap,
  ShieldCheck,
  BarChart3,
  Activity,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard-stats");
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { stats, recentProjects, recentEnquiries } = dashboardData || {
    stats: { totalProjects: 0, activeProjects: 0, totalMachines: 0, totalClients: 0 },
    recentProjects: [],
    recentEnquiries: []
  };

  const statCards = [
    { title: "Total Projects", value: stats.totalProjects, icon: FolderKanban },
    { title: "Active Projects", value: stats.activeProjects, icon: Activity },
    { title: "Machinery Fleet", value: stats.totalMachines, icon: Truck },
    { title: "AI Alerts", value: stats.aiAlerts || 0, icon: Zap, color: "text-rose-500", highlight: true },
    { title: "New Enquiries", value: stats.totalEnquiries || 0, icon: Mail },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of company projects, machinery, and client enquiries.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-2" asChild>
            <Link to="/admin/analytics">
              <Brain className="h-4 w-4 text-primary" />
              AI Analytics
            </Link>
          </Button>
          <Button size="sm" asChild className="shadow-lg shadow-primary/20">
            <Link to="/admin/upload-progress">Update Progress</Link>
          </Button>
        </div>
      </div>

      {/* AI Live Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
        <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Brain className="h-32 w-32 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <h2 className="text-xl font-display font-black tracking-tight text-foreground uppercase">ConstructAI Live</h2>
                </div>
                <p className="text-sm text-muted-foreground max-w-lg">
                  AI engines are monitoring <span className="text-foreground font-bold">{stats.totalProjects}</span> projects and <span className="text-foreground font-bold">{stats.totalMachines}</span> units. 
                  Currently processing real-time telemetry and site photographs.
                </p>
                <div className="pt-2 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Systems Stable</span>
                    </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="text-center px-4 py-3 rounded-2xl bg-background border border-border/50 shadow-sm">
                  <p className="text-[9px] text-muted-foreground uppercase font-black mb-1">Risk Index</p>
                  <p className="text-2xl font-black text-primary">12.4</p>
                </div>
                <div className="text-center px-4 py-3 rounded-2xl bg-background border border-border/50 shadow-sm">
                  <p className="text-[9px] text-muted-foreground uppercase font-black mb-1">Uptime</p>
                  <p className="text-2xl font-black text-emerald-600">99.8%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent flex flex-col justify-center p-6 space-y-3 relative overflow-hidden group shadow-sm transition-all hover:bg-emerald-500/[0.08]">
             <div className="absolute -bottom-4 -right-4 opacity-[0.08] group-hover:scale-125 transition-transform duration-700">
               <ShieldCheck className="h-24 w-24 text-emerald-600" />
             </div>
             <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-emerald-600" />
                </div>
                <Link to="/admin/analytics" className="text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <ArrowUpRight className="h-5 w-5" />
                </Link>
             </div>
             <div>
                <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Fleet Readiness</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-4xl font-black text-foreground">{(stats.totalMachines > 0 ? (stats.totalMachines / stats.totalMachines) * 100 : 0).toFixed(0)}%</h3>
                    <span className="text-xs font-bold text-emerald-600">Secure</span>
                </div>
             </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat: any) => (
          <Card key={stat.title} className={stat.highlight ? "border-rose-500/20 bg-rose-500/[0.02]" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color || "text-primary"}`} />
                <BarChart3 className="h-4 w-4 text-muted-foreground/20" />
              </div>
              <p className={`text-2xl font-display font-black ${stat.highlight ? "text-rose-600" : "text-foreground"}`}>{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/projects" className="gap-1">
                  All Projects <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentProjects.length > 0 ? recentProjects.map((project: any) => (
                <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      <Badge variant="outline" className={
                        project.status === 'COMPLETED' ? 'bg-success/10 text-success border-success/20' :
                          project.status === 'ONGOING' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-muted text-muted-foreground'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Location: {project.location || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground">{project.type}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground text-sm italic">
                  No projects found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Enquiries */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Recent Enquiries
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/enquiries" className="gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentEnquiries.length > 0 ? recentEnquiries.map((enquiry: any, i: number) => (
                <div key={i} className="flex gap-3 text-sm border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{enquiry.name}</p>
                    <p className="text-xs text-primary font-medium">{enquiry.enquiry_type}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{enquiry.message}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-muted-foreground text-sm italic">
                  No enquiries yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link to="/admin/projects">Add New Project</Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link to="/admin/users">Manage Clients</Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <Link to="/admin/machinery">Inventory Check</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

