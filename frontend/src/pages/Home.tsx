import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Droplets, Truck, Award, Users, CheckCircle, ChevronRight, Loader2, MapPin } from "lucide-react";
import heroHome from "@/assets/hero-home.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";

const services = [
  {
    icon: Building2,
    title: "Road Construction",
    description: "State-of-the-art highway and road infrastructure development across Tamil Nadu.",
    href: "/services/road-construction",
  },
  {
    icon: Droplets,
    title: "Water Pipeline",
    description: "Comprehensive water supply and pipeline network installation projects.",
    href: "/services/water-pipeline",
  },
  {
    icon: Truck,
    title: "Machinery Rental",
    description: "Heavy equipment rental including JCB, excavators, rollers and more.",
    href: "/services/machinery-rental",
  },
];

const stats = [
  { value: "150+", label: "Projects Completed" },
  { value: "25+", label: "Years Experience" },
  { value: "500+", label: "Team Members" },
  { value: "12", label: "Districts Served" },
];

const features = [
  "Government Certified Contractor",
  "On-time Project Delivery",
  "Advanced AI Monitoring",
  "Quality Assurance Standards",
  "24/7 Project Support",
  "Transparent Reporting",
];

export default function Home() {
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const [completed, ongoing] = await Promise.all([
          api.get("/public/projects/completed"),
          api.get("/public/projects/ongoing")
        ]);
        
        const allProjects = [
          ...completed.data.data,
          ...ongoing.data.data
        ].filter(p => p.type === 'WATER').slice(0, 3);
        
        setRecentProjects(allProjects);
      } catch (error) {
        console.error("Failed to fetch featured projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchFeaturedProjects();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative hero-gradient text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="container-wide section-padding relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm">
                <Award className="h-4 w-4" />
                Tamil Nadu Government Certified
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight uppercase">
                Thirupathi
                <span className="block text-primary-foreground/80">Constructions</span>
              </h1>
              <p className="text-lg text-primary-foreground/80 max-w-lg">
                Trusted partner for government road construction, water pipeline projects,
                and heavy machinery solutions. Excellence in every project since 1998.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="btn-hero-outline" asChild>
                  <Link to="/projects">
                    View Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in animate-delay-200">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-prominent border border-primary-foreground/20">
                <img src={heroHome} alt="Road construction in progress with heavy machinery" className="w-full h-full object-cover" />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-background rounded-xl p-4 shadow-elevated border animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">98%</p>
                    <p className="text-xs text-muted-foreground">On-time Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted border-y">
        <div className="container-wide py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Complete Infrastructure Solutions
            </h2>
            <p className="text-muted-foreground">
              From roads to pipelines, we deliver comprehensive infrastructure
              development services backed by decades of experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className="group hover:shadow-elevated transition-all duration-300 border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <service.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {service.description}
                  </p>
                  <Link
                    to={service.href}
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Learn More
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-wide">
          <div className="text-center mb-12 animate-fade-in">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Our Work</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
              Featured Pipeline Projects
            </h2>
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-12 bg-background rounded-xl border-2 border-dashed">
              <p className="text-muted-foreground">Welcome to Thirupathi Constructions. New projects will appear here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {recentProjects.map((project, index) => (
                <Card key={project.id} className="group border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-0">
                    <div className="aspect-[1.5/1] bg-slate-50 relative flex items-center justify-center border-b border-slate-100">
                      <div className="p-8 rounded-full bg-white shadow-sm transition-transform group-hover:scale-110 duration-500">
                        {project.type === 'WATER' ? (
                          <Droplets className="h-12 w-12 text-slate-300" />
                        ) : (
                          <Building2 className="h-12 w-12 text-slate-300" />
                        )}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-display font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                            {project.name.toLowerCase()}
                          </h3>
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> @ {project.location.toLowerCase()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-0 font-semibold px-3 py-1">
                          {project.status === 'COMPLETED' ? 'Completed' : 
                           project.status === 'PLANNED' ? 'Planned' : 'In Progress'}
                        </Badge>
                      </div>
                      
                      {/* Subtler Progress */}
                      {project.status !== 'COMPLETED' && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                            <span>Status</span>
                            <span className="text-primary">{project.progress || 0}%</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-1000" 
                              style={{ width: `${project.progress || 0}%` }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-12">
            <Button variant="outline" size="lg" asChild className="gap-2 px-8 py-6 rounded-xl border-2 hover:bg-slate-100 transition-all">
              <Link to="/projects">View All Projects <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-primary mb-2">Why Choose Us</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Trusted by Tamil Nadu Government
              </h2>
              <p className="text-muted-foreground mb-6">
                With over 25 years of experience in government infrastructure projects,
                we bring expertise, reliability, and cutting-edge technology to every project.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Button asChild>
                  <Link to="/about">
                    Learn About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="animate-fade-in animate-delay-200">
              <div className="aspect-square rounded-2xl bg-muted border shadow-elevated overflow-hidden">
                <img src={heroHome} alt="Construction team at work" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-tight text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Get in touch with our team to discuss your infrastructure requirements.
            We're here to help build Tamil Nadu's future.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="btn-hero-outline" asChild>
              <Link to="/contact">
                Request a Quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/projects">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
