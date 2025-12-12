"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User as UserIcon, ShoppingCart } from "lucide-react";

interface HeaderProps {
  cartCount?: number;
}

const Header = ({ cartCount = 0 }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(cartCount);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Load user data only on client side after hydration
  useEffect(() => {
    setIsHydrated(true);
    const userData = localStorage.getItem("user");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/home?section=about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/home?section=services", label: "Services" },
    { href: "/home?section=contact", label: "Contact Us" },
  ];

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setLocalCartCount(customEvent.detail.length);
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  // Update local cart count when prop changes
  useEffect(() => {
    setLocalCartCount(cartCount);
  }, [cartCount]);

  // Determine active section based on pathname
  const currentActive = useMemo(() => {
    if (pathname === "/products" || pathname.startsWith("/products/")) {
      return "products-page";
    }
    return activeSection;
  }, [pathname, activeSection]);

  useEffect(() => {
    // Skip scroll detection on products page
    if (pathname !== "/home" && pathname !== "/") {
      return;
    }

    // For Home page, detect scroll position
    const handleScroll = () => {
      const sections = ["home", "about", "services", "contact"];
      
      // Check from bottom to top to get the most specific section
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(section);
            return;
          }
        }
      }
      // Default to home if no section is in view
      setActiveSection("home");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const isActive = (href: string) => {
    // Check if on products page
    if (href === "/products" && currentActive === "products-page") {
      return true;
    }
    
    // Check if on home page with query params
    if (href.startsWith("/home")) {
      if (href === "/home" && currentActive === "home") {
        return true;
      }
      const sectionMatch = href.match(/section=(\w+)/);
      if (sectionMatch) {
        const section = sectionMatch[1];
        return currentActive === section;
      }
    }
    
    return false;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage as fallback
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      setUser(null);
      setIsUserMenuOpen(false);
      router.push("/login");
    }
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="CraftMarket Logo"
            width={80}
            height={80}
            className="object-contain"
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <ul className="hidden md:flex items-center gap-8 flex-1 justify-center">
          {navLinks.map((link) => (
            <li key={link.href + link.label} className="relative">
              <Link
                href={link.href}
                className={`font-medium text-sm transition-colors ${
                  isActive(link.href)
                    ? "text-[#D4845C]"
                    : "text-gray-900 hover:text-[#D4845C]"
                }`}
                onClick={(e) => {
                  // Jika dari halaman yang sama (Home), gunakan smooth scroll
                  if (pathname === "/home" || pathname === "/" || !pathname.startsWith("/products")) {
                    if (link.href.startsWith("/home?section=")) {
                      e.preventDefault();
                      const sectionMatch = link.href.match(/section=(\w+)/);
                      if (sectionMatch) {
                        const section = sectionMatch[1];
                        const element = document.getElementById(section);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }
                    }
                  }
                  // Jika dari halaman berbeda, biarkan navigasi normal (langsung ke atas)
                }}
              >
                {link.label}
              </Link>
              {isActive(link.href) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4845C]" />
              )}
            </li>
          ))}
        </ul>

        {/* Right Side: User Info / Login Button */}
        <div className="hidden md:flex items-center gap-4">
          {isHydrated && user ? (
            <>
              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart size={20} className="text-[#D4845C]" />
                {localCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {localCartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <UserIcon size={20} className="text-[#D4845C]" />
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-xs text-gray-500">Logged in as:</p>
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    {user.role === "buyer" && (
                      <Link
                        href="/orders"
                        className="block px-4 py-3 text-gray-900 hover:bg-gray-100 transition text-sm font-medium border-b border-gray-200"
                      >
                        📦 Pesanan Saya
                      </Link>
                    )}
                    {user.role === "seller" && (
                      <Link
                        href="/seller/dasboard"
                        className="block px-4 py-3 text-gray-900 hover:bg-gray-100 transition text-sm font-medium border-b border-gray-200"
                      >
                        📊 Dashboard Seller
                      </Link>
                    )}
                    {user.role === "buyer" && (
                      <Link
                        href="/seller/register"
                        className="block px-4 py-3 text-[#D4845C] hover:bg-orange-50 transition text-sm font-medium border-b border-gray-200"
                      >
                        ⭐ Jadi Seller
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : isHydrated ? (
            <>
              {/* Cart Icon untuk non-login user */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart size={20} className="text-[#D4845C]" />
                {localCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {localCartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-[#C4B5A5] text-white font-medium hover:bg-[#B3A290] transition text-sm"
              >
                Login
              </Link>
            </>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span
            className={`w-6 h-0.5 bg-gray-800 transition-all ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-gray-800 transition-all ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-gray-800 transition-all ${
              isMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-6">
          <ul className="flex flex-col gap-4 mb-4">
            {navLinks.map((link) => (
              <li key={link.href + link.label}>
                <Link
                  href={link.href}
                  className="text-gray-900 hover:text-[#D4845C] font-medium transition-colors block"
                  onClick={(e) => {
                    setIsMenuOpen(false);
                    // Jika dari halaman yang sama (Home), gunakan smooth scroll
                    if (pathname === "/home" || pathname === "/" || !pathname.startsWith("/products")) {
                      if (link.href.startsWith("/home?section=")) {
                        e.preventDefault();
                        const sectionMatch = link.href.match(/section=(\w+)/);
                        if (sectionMatch) {
                          const section = sectionMatch[1];
                          const element = document.getElementById(section);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }
                      }
                    }
                    // Jika dari halaman berbeda, biarkan navigasi normal (langsung ke atas)
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile User Info / Login */}
          {isHydrated && user ? (
            <div className="border-t border-gray-200 pt-4">
              <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                <p className="text-xs text-gray-500">Logged in as:</p>
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              {user.role === "buyer" && (
                <Link
                  href="/orders"
                  className="block w-full px-4 py-3 mb-2 bg-blue-600 text-white rounded-lg font-medium transition text-sm text-center"
                >
                  📦 Pesanan Saya
                </Link>
              )}
              {user.role === "seller" && (
                <Link
                  href="/seller/dasboard"
                  className="block w-full px-4 py-3 mb-2 bg-[#D4845C] text-white rounded-lg font-medium transition text-sm text-center"
                >
                  📊 Dashboard Seller
                </Link>
              )}
              {user.role === "buyer" && (
                <Link
                  href="/seller/register"
                  className="block w-full px-4 py-3 mb-2 bg-[#F4A56B] text-white rounded-lg font-medium transition text-sm text-center"
                >
                  ⭐ Jadi Seller
                </Link>
              )}
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-3 bg-[#C4B5A5] text-white rounded-lg font-medium transition text-sm"
              >
                <ShoppingCart size={18} />
                Keranjang {localCartCount > 0 && `(${localCartCount})`}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition text-sm font-medium rounded-lg"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : isHydrated ? (
            <>
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-3 bg-[#C4B5A5] text-white rounded-lg font-medium transition text-sm"
              >
                <ShoppingCart size={18} />
                Keranjang {localCartCount > 0 && `(${localCartCount})`}
              </Link>
              <Link
                href="/login"
                className="block w-full px-4 py-3 rounded-lg bg-gray-400 text-gray-800 font-medium hover:bg-gray-500 transition text-center text-sm"
              >
                Login
              </Link>
            </>
          ) : null}
        </div>
      )}
    </header>
  );
};

export default Header;
