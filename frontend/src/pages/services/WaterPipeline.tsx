import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Droplets, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import serviceWaterImg from "@/assets/service-water.jpg";
import api from "@/lib/axios";

const capabilities = [
  "Water Supply Networks",
  "Pipeline Installation",
  "Pump House Construction",
  "Water Treatment Plants",
  "Sewage Systems",
  "Drainage Networks",
  "Underground Tanks",
  "Valve Chambers",
];

export default function WaterPipeline() {
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [completed, ongoing] = await Promise.all([
          api.get("/public/projects/completed"),
          api.get("/public/projects/ongoing")
        ]);
        
        const allProjects = [
          ...completed.data.data.filter((p: any) => p.type === "WATER"),
          ...ongoing.data.data.filter((p: any) => p.type === "WATER")
        ].slice(0, 3);
        
        setDbProjects(allProjects);
      } catch (error) {
        console.error("Failed to fetch water projects", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-wide">
          <Link
            to="/services"
            className="inline-flex items-center text-primary-foreground/70 hover:text-primary-foreground mb-6 text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>
          <div className="max-w-3xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Droplets className="h-6 w-6" />
              </div>
              <p className="text-primary-foreground/70 text-sm font-medium">Service</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Water Pipeline Projects
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Delivering clean water to millions through advanced pipeline infrastructure 
              and water supply network solutions across Tamil Nadu.
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                End-to-End Water Solutions
              </h2>
              <p className="text-muted-foreground mb-6">
                We partner with TWAD Board, Metro Water, and municipal corporations to 
                design and implement comprehensive water supply and distribution networks 
                that serve urban and rural communities.
              </p>
              <p className="text-muted-foreground mb-6">
                Our expertise spans from source development and treatment plants to 
                last-mile distribution networks, ensuring every household has access 
                to clean, safe water.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.map((cap) => (
                  <div key={cap} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in animate-delay-200">
              <div className="aspect-video rounded-2xl bg-muted border shadow-elevated overflow-hidden">
                <img src={serviceWaterImg} alt="Water pipeline construction project" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Work</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Featured Pipeline Projects
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : dbProjects.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">New water projects will appear here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {dbProjects.map((project, index) => (
                <Card key={project.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="aspect-video rounded-lg bg-background mb-4 overflow-hidden relative flex items-center justify-center border">
                      <Droplets className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-1">{project.name}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {project.location}
                      </span>
                      <span className={project.status === "COMPLETED" ? "text-primary font-medium" : "text-amber-600 font-medium"}>
                        {project.status === "COMPLETED" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/projects">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-tight text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Start Your Water Project
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Contact our water infrastructure team for expert consultation 
            and project planning.
          </p>
          <Button size="lg" className="btn-hero-outline" asChild>
            <Link to="/contact">
              Request Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
