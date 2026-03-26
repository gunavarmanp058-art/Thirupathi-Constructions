import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Droplets, MapPin, Calendar, CheckCircle, Clock, Loader2 } from "lucide-react";
import heroProjects from "@/assets/hero-projects.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

const statusColor = (status: string) => {
  if (status === "COMPLETED") return "bg-green-100 text-green-800 border-green-200";
  if (status === "ON_HOLD") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "ONGOING") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-slate-100 text-slate-800 border-slate-200";
};

export default function Projects() {
  const [activeTab, setActiveTab] = useState("completed");

  const { data: completedProjects = [], isLoading: isLoadingCompleted } = useQuery({
    queryKey: ["public-projects-completed"],
    queryFn: async () => {
      const response = await api.get("/public/projects/completed");
      return response.data.data;
    },
  });

  const { data: ongoingProjects = [], isLoading: isLoadingOngoing } = useQuery({
    queryKey: ["public-projects-ongoing"],
    queryFn: async () => {
      const response = await api.get("/public/projects/ongoing");
      return response.data.data;
    },
  });

  const getIcon = (type: string) => {
    return type === "WATER" ? Droplets : Building2;
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative hero-gradient text-primary-foreground section-padding overflow-hidden">
        <img src={heroProjects} alt="Aerial view of highway construction" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-primary-foreground/70 mb-4 text-sm font-medium">Our Projects</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Building Tamil Nadu's Future
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Explore our portfolio of completed and ongoing infrastructure projects
              across Tamil Nadu.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({completedProjects.length})
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Ongoing ({ongoingProjects.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="completed">
              {(isLoadingCompleted) ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : completedProjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No completed projects found.</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedProjects.map((project: any, index: number) => {
                    const ProjectIcon = getIcon(project.type);
                    return (
                      <Card
                        key={project.id}
                        className="group hover:shadow-elevated transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ProjectIcon className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                            <Badge className={`absolute top-3 left-3 border ${statusColor(project.status)}`} variant="outline">
                              Completed
                            </Badge>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <ProjectIcon className="h-3 w-3" />
                                {project.type} Construction
                              </span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              Project successfully delivered in {project.location}.
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {project.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ongoing">
              {(isLoadingOngoing) ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : ongoingProjects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No ongoing projects found.</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingProjects.map((project: any, index: number) => {
                    const ProjectIcon = getIcon(project.type);
                    const progressVal = project.progress || 0;
                    return (
                      <Card
                        key={project.id}
                        className="group hover:shadow-elevated transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-0">
                          <div className="aspect-video bg-muted relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ProjectIcon className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                            <Badge className={`absolute top-3 left-3 border ${statusColor(project.status)}`} variant="outline">
                              {project.status === 'PLANNED' ? 'Planned' : 'In Progress'}
                            </Badge>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <ProjectIcon className="h-3 w-3" />
                                {project.type} Construction
                              </span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {project.name}
                            </h3>

                            {/* Progress Bar */}
                            <div className="mb-4 mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground font-medium">Progress</span>
                                <span className="text-primary font-bold">{progressVal}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${progressVal}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {project.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Est. {new Date(project.expected_end).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted border-y py-12">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "150+", label: "Projects Completed" },
              { value: "25+", label: "Years Experience" },
              { value: "400+ km", label: "Pipelines Laid" },
              { value: "12", label: "Districts Served" },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-tight text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Have a Project in Mind?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Partner with us to bring your infrastructure vision to life with
            proven expertise and reliable delivery.
          </p>
          <Button size="lg" className="btn-hero-outline" asChild>
            <Link to="/contact">
              Start a Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
