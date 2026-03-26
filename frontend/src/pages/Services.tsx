import { Link } from "react-router-dom";
import { ArrowRight, Building2, Droplets, Truck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import heroServicesImg from "@/assets/hero-services.jpg";
import serviceRoadImg from "@/assets/service-road.jpg";
import serviceWaterImg from "@/assets/service-water.jpg";
import serviceMachineryImg from "@/assets/service-machinery.jpg";

const serviceImages = {
  "road-construction": serviceRoadImg,
  "water-pipeline": serviceWaterImg,
  "machinery-rental": serviceMachineryImg,
};

const services = [
  {
    icon: Building2,
    title: "Road Construction",
    slug: "road-construction" as keyof typeof serviceImages,
    description: "Comprehensive road infrastructure development including highways, state roads, and urban roads.",
    features: [
      "National & State Highway Construction",
      "Urban Road Development",
      "Bridge & Culvert Construction",
      "Road Widening & Upgrading",
      "Bituminous & Concrete Surfacing",
      "Traffic Management Solutions",
    ],
    stats: { projects: "80+", kilometers: "450+ km" },
  },
  {
    icon: Droplets,
    title: "Water Pipeline Projects",
    slug: "water-pipeline" as keyof typeof serviceImages,
    description: "End-to-end water supply and pipeline network solutions for municipalities and rural areas.",
    features: [
      "Water Supply Network Installation",
      "Pipeline Laying & Jointing",
      "Pump House Construction",
      "Water Treatment Plants",
      "Sewage & Drainage Systems",
      "Underground Tank Construction",
    ],
    stats: { projects: "45+", pipelines: "300+ km" },
  },
  {
    icon: Truck,
    title: "Machinery Rental",
    slug: "machinery-rental" as keyof typeof serviceImages,
    description: "Heavy equipment rental with operator support for construction and infrastructure projects.",
    features: [
      "JCB & Excavators",
      "Road Rollers & Compactors",
      "Cranes & Lifting Equipment",
      "Concrete Mixers & Pumps",
      "Dozers & Graders",
      "Trained Operator Support",
    ],
    stats: { machines: "50+", operators: "100+" },
  },
];

export default function Services() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative text-primary-foreground section-padding overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroServicesImg} alt="Infrastructure construction services" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container-wide relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-white/70 mb-4 text-sm font-medium">Our Services</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
              Complete Infrastructure Solutions
            </h1>
            <p className="text-lg text-white/80">
              From road construction to water pipeline projects and heavy machinery rental, 
              we provide end-to-end infrastructure development services.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={service.slug}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-fade-in ${
                  index % 2 !== 0 ? "lg:flex-row-reverse" : ""
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={index % 2 !== 0 ? "lg:order-2" : ""}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                      {service.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  
                  <div className="grid sm:grid-cols-2 gap-2 mb-6">
                    {service.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 mb-6">
                    {Object.entries(service.stats).map(([key, value]) => (
                      <div key={key} className="bg-muted rounded-lg px-4 py-2">
                        <p className="text-xl font-display font-bold text-primary">{value}</p>
                        <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      </div>
                    ))}
                  </div>

                  <Button asChild>
                    <Link to={`/services/${service.slug}`}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className={index % 2 !== 0 ? "lg:order-1" : ""}>
                  <div className="aspect-[4/3] rounded-2xl bg-muted border shadow-elevated overflow-hidden">
                    <img src={serviceImages[service.slug]} alt={service.title} className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Process</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              How We Work
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Consultation", description: "Initial project assessment and requirement gathering" },
              { step: "02", title: "Planning", description: "Detailed project planning and resource allocation" },
              { step: "03", title: "Execution", description: "Professional implementation with quality checks" },
              { step: "04", title: "Delivery", description: "On-time project handover with documentation" },
            ].map((item, index) => (
              <Card
                key={item.step}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <span className="text-5xl font-display font-bold text-primary/10">{item.step}</span>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
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
            Need a Custom Solution?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Contact our team to discuss your specific infrastructure requirements 
            and get a customized proposal.
          </p>
          <Button size="lg" className="btn-hero-outline" asChild>
            <Link to="/contact">
              Request a Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
