import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import serviceMachineryImg from "@/assets/service-machinery.jpg";
import api from "@/lib/axios";

const features = [
  "Well-maintained fleet of construction machines",
  "Trained and certified operators",
  "24/7 breakdown support",
  "Flexible hire periods",
  "Competitive daily/monthly rates",
  "On-site delivery available",
  "AI-based maintenance prediction",
  "Real-time machine tracking",
];

export default function MachineryRental() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachinery = async () => {
      try {
        setLoading(true);
        const res = await api.get("/public/machines");
        // Take top 3 for featured
        setEquipment(res.data.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch machinery", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMachinery();
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
                <Truck className="h-6 w-6" />
              </div>
              <p className="text-primary-foreground/70 text-sm font-medium">Service</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Machinery Hire
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Heavy construction equipment hire with experienced operators and
              AI-powered maintenance monitoring for maximum uptime.
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
                Reliable Equipment, Expert Support
              </h2>
              <p className="text-muted-foreground mb-6">
                Our machinery division provides high-quality construction equipment
                to contractors, government agencies, and private developers across Tamil Nadu.
              </p>
              <p className="text-muted-foreground mb-6">
                With AI-powered predictive maintenance, we ensure maximum machine uptime
                and provide real-time condition monitoring for all hired equipment.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-fade-in animate-delay-200">
              <div className="aspect-video rounded-2xl bg-muted border shadow-elevated overflow-hidden">
                <img src={serviceMachineryImg} alt="Heavy construction machinery fleet" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Fleet */}
      <section className="section-padding bg-muted">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">Our Fleet</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Featured Equipment
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : equipment.length > 0 ? (
              equipment.map((item, index) => (
                <Card key={item.id} className="animate-fade-in overflow-hidden group" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-0">
                    <div className="aspect-[4/3] bg-background relative overflow-hidden flex items-center justify-center border-b">
                      {item.image_url ? (
                        <img 
                          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${item.image_url}`} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                      ) : (
                        <Truck className="h-12 w-12 text-muted-foreground/30" />
                      )}
                      {item.status === 'ASSIGNED' && (
                        <div className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-background/90 text-foreground text-xs font-bold px-3 py-1.5 rounded">NOT AVAILABLE</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold text-foreground">{item.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground uppercase">{item.type}</span>
                        <span className={`text-xs font-medium ${item.status === 'AVAILABLE' ? 'text-green-600' : 'text-amber-600'}`}>
                          {item.status === 'AVAILABLE' ? 'Available Now' : 'Not Available'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No equipment currently listed in the fleet.
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/machinery">
                View Full Gallery
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
            Rent Equipment Today
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Get competitive rates on our well-maintained machinery fleet
            with operator support and 24/7 service.
          </p>
          <Button size="lg" className="btn-hero-outline" asChild>
            <Link to="/contact">
              Get Hire Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
