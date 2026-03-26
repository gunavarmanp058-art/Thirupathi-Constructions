import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, HardHat, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  {
    name: "Services",
    href: "/services",
    children: [
      { name: "Road Construction", href: "/services/road-construction" },
      { name: "Water Pipeline", href: "/services/water-pipeline" },
      { name: "Machinery Rental", href: "/services/machinery-rental" },
    ],
  },
  { name: "Projects", href: "/projects" },
  { name: "Machinery", href: "/machinery" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname === child.href);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <nav className="container-wide" aria-label="Global">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <HardHat className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-lg font-bold text-foreground leading-tight uppercase">
                Thirupathi Constructions
              </p>
              <p className="text-xs text-muted-foreground">
                Government Infrastructure Partner
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {navigation.map((item) =>
              item.children ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`gap-1 ${
                        isChildActive(item.children)
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.name} asChild>
                        <Link
                          to={child.href}
                          className={isActive(child.href) ? "text-primary font-medium" : ""}
                        >
                          {child.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  key={item.name}
                  variant="ghost"
                  asChild
                  className={
                    isActive(item.href)
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link to="/client/dashboard" className="gap-2">
                <User className="h-4 w-4" />
                Client Portal
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4 animate-fade-in">
            <div className="space-y-1">
              {navigation.map((item) =>
                item.children ? (
                  <div key={item.name} className="space-y-1">
                    <p className="px-3 py-2 text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        className={`block px-6 py-2 text-sm ${
                          isActive(child.href)
                            ? "text-primary font-medium bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block px-3 py-2 text-sm ${
                      isActive(item.href)
                        ? "text-primary font-medium bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex flex-col gap-2 px-3">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/client/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Client Portal
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
