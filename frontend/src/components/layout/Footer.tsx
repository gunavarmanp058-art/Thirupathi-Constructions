import { Link } from "react-router-dom";
import { HardHat, Phone, Mail, MapPin, Facebook, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  services: [
    { name: "Road Construction", href: "/services/road-construction" },
    { name: "Water Pipeline", href: "/services/water-pipeline" },
    { name: "Machinery Rental", href: "/services/machinery-rental" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Machinery Gallery", href: "/machinery" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Tender Information", href: "/tenders" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-wide section-padding !py-12 lg:!py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HardHat className="h-6 w-6" />
              </div>
              <div>
                <p className="font-display text-lg font-bold leading-tight">
                  Thirupathi Constructions
                </p>
                <p className="text-xs text-background/60">
                  Government Infrastructure Partner
                </p>
              </div>
            </Link>
            <p className="text-sm text-background/70 mb-4">
              Building Tamil Nadu's infrastructure with excellence. Trusted partner 
              for government road, water pipeline, and infrastructure projects.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/10 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-4 text-background">
              Our Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-4 text-background">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-sm font-semibold mb-4 text-background">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  39-1/1, Kaveri Nagar,<br />
                  4th Cross Karur - 639003
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+919443259661" className="hover:text-primary transition-colors">
                  +91 94432 59661
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:thiruppathi400@gmail.com" className="hover:text-primary transition-colors">
                  thiruppathi400@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-wide py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-background/50">
            © {new Date().getFullYear()} Thirupathi Constructions. All rights reserved.
          </p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-xs text-background/50 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
