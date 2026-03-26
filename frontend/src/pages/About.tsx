import { Link } from "react-router-dom";
import { ArrowRight, Award, Target, Eye, Users, Building2, Calendar, Shield } from "lucide-react";
import heroAbout from "@/assets/hero-about.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const milestones = [
  { year: "1998", title: "Company Founded", description: "Started as a small road contractor in Chennai" },
  { year: "2005", title: "Government Certification", description: "Received Class A contractor certification" },
  { year: "2012", title: "Expansion", description: "Extended services to water pipeline projects" },
  { year: "2018", title: "Technology Integration", description: "Introduced AI-based project monitoring" },
  { year: "2023", title: "150+ Projects", description: "Completed milestone of 150 government projects" },
];

const values = [
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Every project meets the highest quality standards set by government regulations.",
  },
  {
    icon: Calendar,
    title: "Timely Delivery",
    description: "98% on-time completion rate across all our infrastructure projects.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "500+ skilled professionals with decades of combined experience.",
  },
  {
    icon: Award,
    title: "Certified Excellence",
    description: "ISO certified with multiple government contractor certifications.",
  },
];

const leadership = [
  { name: "Rajesh Kumar", role: "Managing Director", experience: "30+ years" },
  { name: "Priya Venkatesh", role: "Chief Operations Officer", experience: "25+ years" },
  { name: "Suresh Babu", role: "Technical Director", experience: "28+ years" },
  { name: "Lakshmi Narayanan", role: "Finance Director", experience: "22+ years" },
];

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-primary-foreground/70 mb-4 text-sm font-medium">About Us</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Thirupathi Constructions - Building Tamil Nadu's Infrastructure Since 1998
            </h1>
            <p className="text-lg text-primary-foreground/80">
              A trusted government infrastructure partner delivering excellence in road construction, 
              water pipeline projects, and heavy machinery solutions across Tamil Nadu.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-primary animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold">Our Mission</h3>
                </div>
                <p className="text-muted-foreground">
                  To deliver world-class infrastructure projects that enhance the quality of life 
                  for Tamil Nadu citizens, while maintaining the highest standards of safety, 
                  quality, and environmental responsibility.
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary animate-fade-in animate-delay-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-semibold">Our Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  To be the most trusted infrastructure development company in South India, 
                  recognized for innovation, integrity, and commitment to building sustainable 
                  communities for future generations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-primary mb-2">Our Story</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                25 Years of Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 1998 by a team of civil engineers with a vision to transform 
                  Tamil Nadu's infrastructure landscape, Thirupathi Constructions has grown from a 
                  small road contractor to one of the state's leading infrastructure companies.
                </p>
                <p>
                  Today, we are proud to be a Class A government-certified contractor, 
                  having completed over 150 major projects including highways, district roads, 
                  water supply networks, and pipeline installations across 12 districts.
                </p>
                <p>
                  Our commitment to quality, safety, and timely delivery has earned us the 
                  trust of Tamil Nadu Public Works Department, TWAD Board, and numerous 
                  municipal corporations.
                </p>
              </div>
            </div>
            <div className="animate-fade-in animate-delay-200">
              <div className="aspect-video rounded-2xl bg-background border shadow-elevated overflow-hidden">
                <img src={heroAbout} alt="Construction team in front of completed bridge project" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Journey</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Key Milestones
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-border" />
              
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex items-start gap-4 md:gap-8 mb-8 animate-fade-in ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"} hidden md:block`}>
                    {index % 2 === 0 && (
                      <div className="bg-background border rounded-lg p-4 shadow-soft">
                        <p className="text-sm text-primary font-semibold">{milestone.year}</p>
                        <h3 className="font-display font-semibold text-foreground">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <div className="h-3 w-3 rounded-full bg-primary-foreground" />
                    </div>
                  </div>
                  
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                    {index % 2 !== 0 ? (
                      <div className="bg-background border rounded-lg p-4 shadow-soft hidden md:block">
                        <p className="text-sm text-primary font-semibold">{milestone.year}</p>
                        <h3 className="font-display font-semibold text-foreground">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                    ) : null}
                    {/* Mobile view */}
                    <div className="bg-background border rounded-lg p-4 shadow-soft md:hidden">
                      <p className="text-sm text-primary font-semibold">{milestone.year}</p>
                      <h3 className="font-display font-semibold text-foreground">{milestone.title}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Values</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              What Drives Us
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Leadership</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Our Leadership Team
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, index) => (
              <Card
                key={leader.name}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="aspect-square rounded-lg bg-muted mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{leader.name}</h3>
                  <p className="text-sm text-primary">{leader.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{leader.experience} experience</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient text-primary-foreground section-padding">
        <div className="container-tight text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Partner With Us
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join the many government agencies and organizations who trust us 
            to deliver quality infrastructure projects.
          </p>
          <Button size="lg" className="btn-hero-outline" asChild>
            <Link to="/contact">
              Get In Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
