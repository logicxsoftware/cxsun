import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@cxsun/ui/components/navigation-menu";
import {
  ArrowRightIcon,
  HomeIcon,
  LayoutGridIcon,
  MenuIcon,
  SearchIcon,
  ShoppingCartIcon,
  SparklesIcon,
  UserRoundIcon,
  XIcon
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { StorefrontSearch } from "./storefront.search1";
import type {
  StorefrontBranding,
  StorefrontDiscovery,
  StorefrontFilters
} from "./storefront.types";
import type { StorefrontAnnouncement } from "./storefront.types";
import { StorefrontAnnouncementBanner } from "./storefront.announcement";
import { TechMediaMark } from "./storefront.brand";
import { useStorefrontCartCount } from "./storefront.cart";
import "./storefront.navigation1.css";

export function StoreHeader({
  announcement,
  branding,
  discovery,
  filters
}: {
  announcement: StorefrontAnnouncement | null;
  branding: StorefrontBranding | null;
  discovery: StorefrontDiscovery;
  filters: StorefrontFilters;
}) {
  const cartCount = useStorefrontCartCount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const mobileMenu = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileMenuOpen(false);
      mobileMenuButton.current?.focus();
    };
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (mobileMenu.current?.contains(target) || mobileMenuButton.current?.contains(target))
        return;
      setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOutside);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOutside);
    };
  }, [mobileMenuOpen]);

  const brandTitle = "Tech Media";

  return (
    <>
      {/* 1. Animated Running Ticker Top Green Banner */}
      <TopGreenRunningBanner announcement={announcement} />

      {/* 2. Main Redesigned Navbar (White Band) */}
      <header className="cx-store__header">
        <div className="cx-store__header-inner">
          {/* Brand Logo */}
          <div className="cx-store__header-left">
            <a className="cx-store__brand" href="/">
              <TechMediaMark className="cx-store__brand-mark" />
              <strong>{brandTitle}</strong>
            </a>
          </div>

          {/* Search Bar & Actions */}
          <div className="cx-store__header-right">
            <StorefrontSearch branding={branding} discovery={discovery} filters={filters} />

            <div className="cx-store__header-actions">
              {/* Shopping Cart with Red Badge */}
              <a
                aria-label={`Shopping cart, ${cartCount || 10} items`}
                className="cx-store__header-icon cx-store__header-icon--cart"
                href="/cart"
              >
                <ShoppingCartIcon aria-hidden="true" />
                <span aria-hidden="true" className="cx-store__cart-count">
                  {cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : 10}
                </span>
              </a>

              {/* User Account Circular Button */}
              <a
                aria-label="Customer account"
                className="cx-store__header-icon cx-store__header-icon--account"
                href="/login"
              >
                <UserRoundIcon aria-hidden="true" />
              </a>

              {/* Mobile / Quick Menu Hamburger Button */}
              <button
                aria-controls="storefront-mobile-menu"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="cx-store__mobile-menu-button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                ref={mobileMenuButton}
                type="button"
              >
                {mobileMenuOpen ? <XIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Sleek Black Band Secondary Navigation */}
        <div className="cx-store__black-band">
          <div className="cx-store__black-band-inner">
            <StoreNavigation branding={branding} discovery={discovery} />

            <div className="cx-store__black-band-support">
              <span className="cx-store__black-band-location">
                📍 Tiruppur • On-Site IT Support
              </span>
              <a
                className="cx-store__black-band-phone"
                href="tel:+919842271114"
              >
                📞 +91 98422 71114
              </a>
            </div>
          </div>
        </div>

        <MobileStoreNavigation
          cartCount={cartCount > 0 ? cartCount : 10}
          menuRef={mobileMenu}
          open={mobileMenuOpen}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      </header>

      {/* 4. Docked Mobile Bottom Navigation Bar */}
      <MobileBottomNav cartCount={cartCount > 0 ? cartCount : 10} />
    </>
  );
}

function TopGreenRunningBanner({
  announcement
}: {
  announcement: StorefrontAnnouncement | null;
}) {
  const tickerItems = [
    announcement?.message,
    "⚡ Summer Tech Upgrade Fest 2026 is LIVE — Save up to 40% on Workstations & Laptops",
    "🚚 Free Express Delivery in Tiruppur on Orders Over ₹999",
    "🛡️ 100% Genuine Multi-Brand Hardware with Official Manufacturer Warranty",
    "🎧 Special Offer: Sony WH-1000XM5 Noise Cancelling Headphones — Save ₹5,000 Today",
    "📱 Flagship Bundle Deal: Galaxy S24 Ultra with Free Wireless Galaxy Buds",
    "💼 Business IT Infrastructure, Workstations & Networking Solutions",
    "📞 Call Tech Media Support: +91 98422 71114"
  ].filter(Boolean) as string[];

  return (
    <aside aria-label="Store promotional ticker" className="cx-store__top-green-banner">
      <div className="cx-ticker-track-wrapper">
        <div className="cx-ticker-track">
          {/* Render duplicated list for infinite seamless running loop */}
          {[...tickerItems, ...tickerItems].map((text, idx) => (
            <span className="cx-ticker-item" key={idx}>
              <span className="cx-ticker-sparkle" aria-hidden="true">✦</span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function MobileStoreNavigation({
  cartCount,
  menuRef,
  open,
  onNavigate
}: {
  cartCount: number;
  menuRef: RefObject<HTMLElement | null>;
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav
      aria-label="Mobile store navigation"
      className={`cx-store__mobile-nav${open ? " is-open" : ""}`}
      id="storefront-mobile-menu"
      ref={menuRef}
    >
      <a href="/search" onClick={onNavigate}>
        <SearchIcon aria-hidden="true" />
        <span>
          <strong>Search</strong>
          <small>Find products across the catalog</small>
        </span>
      </a>
      <a href="/cart" onClick={onNavigate}>
        <ShoppingCartIcon aria-hidden="true" />
        <span>
          <strong>Cart</strong>
          <small>
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </small>
        </span>
        <b className="cx-store__mobile-cart-count">{cartCount > 99 ? "99+" : cartCount}</b>
      </a>
      <a href="/login" onClick={onNavigate}>
        <UserRoundIcon aria-hidden="true" />
        <span>
          <strong>Account</strong>
          <small>Sign in or manage your profile</small>
        </span>
      </a>
      <span className="cx-store__mobile-nav-label">Menu</span>
      <a href="/" onClick={onNavigate}>
        <span>
          <strong>Home</strong>
          <small>Storefront highlights and featured picks</small>
        </span>
      </a>
      <a href="/shop" onClick={onNavigate}>
        <span>
          <strong>Shop</strong>
          <small>Browse all products</small>
        </span>
      </a>
      <a href="/#solutions" onClick={onNavigate}>
        <span>
          <strong>Solutions</strong>
          <small>Find the right setup</small>
        </span>
      </a>
      <a href="/about" onClick={onNavigate}>
        <span>
          <strong>Company</strong>
          <small>About and contact</small>
        </span>
      </a>
      <a href="/campaigns" onClick={onNavigate}>
        <span>
          <strong>Campaigns and events</strong>
          <small>Current offers, launches, and programmes</small>
        </span>
      </a>
      <a href="/blog" onClick={onNavigate}>
        <span>
          <strong>Blog</strong>
          <small>Guides and advice</small>
        </span>
      </a>
    </nav>
  );
}

function MobileBottomNav({ cartCount }: { cartCount: number }) {
  const [pathname, setPathname] = useState("");
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
      const handlePopState = () => setPathname(window.location.pathname);
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  useEffect(() => {
    const footer = document.querySelector(".cx-store-luxury-footer, .cx-store__footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -68px 0px", threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const navItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: HomeIcon,
      isActive: pathname === "/" || pathname === ""
    },
    {
      id: "categories",
      label: "Categories",
      href: "/shop",
      icon: LayoutGridIcon,
      isActive: pathname.startsWith("/shop") || pathname.startsWith("/category")
    },
    {
      id: "deals",
      label: "Deals",
      href: "/campaigns",
      icon: SparklesIcon,
      isSpecial: true,
      badge: "HOT",
      isActive: pathname.startsWith("/campaigns") || pathname.startsWith("/deals")
    },
    {
      id: "cart",
      label: "Cart",
      href: "/cart",
      icon: ShoppingCartIcon,
      countBadge: cartCount > 0 ? (cartCount > 99 ? "99+" : cartCount) : 10,
      isActive: pathname.startsWith("/cart")
    },
    {
      id: "account",
      label: "Account",
      href: "/login",
      icon: UserRoundIcon,
      isActive: pathname.startsWith("/login") || pathname.startsWith("/account")
    }
  ];

  return (
    <nav
      aria-hidden={footerVisible}
      aria-label="Mobile bottom navigation"
      className={`cx-mobile-bottom-nav${footerVisible ? " is-hidden" : ""}`}
      inert={footerVisible}
    >
      <div className="cx-mobile-bottom-nav__inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              aria-current={item.isActive ? "page" : undefined}
              className={`cx-mobile-bottom-nav__item ${item.isActive ? "is-active" : ""} ${
                item.isSpecial ? "cx-mobile-bottom-nav__item--special" : ""
              }`}
              href={item.href}
              key={item.id}
            >
              <div className="cx-mobile-bottom-nav__icon-wrapper">
                <Icon aria-hidden="true" className="cx-mobile-bottom-nav__icon" />
                {item.countBadge !== undefined ? (
                  <span
                    aria-label={`${item.countBadge} items in cart`}
                    className="cx-mobile-bottom-nav__badge"
                  >
                    {item.countBadge}
                  </span>
                ) : null}
                {item.badge ? (
                  <span aria-hidden="true" className="cx-mobile-bottom-nav__pill-badge">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="cx-mobile-bottom-nav__label">{item.label}</span>
              {item.isActive ? (
                <span aria-hidden="true" className="cx-mobile-bottom-nav__active-indicator" />
              ) : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function StoreNavigation({
  branding,
  discovery
}: {
  branding: StorefrontBranding | null;
  discovery: StorefrontDiscovery;
}) {
  const brandName = "Tech Media";
  return (
    <NavigationMenu
      aria-label="Store navigation"
      className="cx-store__primary-nav"
      delayDuration={80}
      skipDelayDuration={180}
    >
      <NavigationMenuList className="cx-store__nav-list">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct" href="/">
              Home
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <StoreMenu label="Shop">
          <MenuFeature
            description="Compare dependable computers and accessories for work, study, and creativity."
            eyebrow="Computer store"
            href="/shop"
            title="Find the right system"
          />
          <MenuColumn title="Categories">
            {discovery.categories.slice(0, 5).map((item) => (
              <MenuLink href={`/shop/category/${encodeURIComponent(item.name)}`} key={item.name}>
                {item.name}
                <small>{item.productCount}</small>
              </MenuLink>
            ))}
          </MenuColumn>
          <MenuColumn title="Discover">
            <MenuLink href="/#promotions">Current promotions</MenuLink>
            <MenuLink href="/#brands">Shop by brand</MenuLink>
            <MenuLink href="/search?sort=featured">Featured systems</MenuLink>
          </MenuColumn>
        </StoreMenu>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct" href="/shop/category/Laptops">
              Laptops
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct" href="/shop/category/Smartphones">
              Smartphones
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct" href="/shop/category/Audio">
              Audio
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct cx-store__deal-link" href="/campaigns">
              <span className="cx-store__deal-bolt">⚡</span> Today&apos;s Deals
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <StoreMenu label="Solutions">
          <MenuFeature
            description="Browse products for work, upgrades, and everyday technology needs."
            eyebrow="Explore products"
            href="/shop"
            title="Find your solution"
          />
          <MenuColumn title="For your work">
            <MenuLink href="/search?q=business%20systems">Business systems</MenuLink>
            <MenuLink href="/search?q=laptop">Mobile and remote work</MenuLink>
            <MenuLink href="/search?q=workstation">Focused workspaces</MenuLink>
          </MenuColumn>
          <MenuColumn title="Keep it working">
            <MenuLink href="/search?q=computer%20upgrade">Performance upgrades</MenuLink>
            <MenuLink href="/search?q=network">
              Network security
            </MenuLink>
            <MenuLink href="/search?q=maintenance">Maintenance</MenuLink>
          </MenuColumn>
        </StoreMenu>

        <StoreMenu label="Company">
          <MenuFeature
            description={`Meet the team and learn how ${brandName} helps customers make durable technology decisions.`}
            eyebrow={`About ${brandName}`}
            href="/about"
            title="Technology with useful support"
          />
          <MenuColumn title="Company">
            <MenuLink href="/about">About</MenuLink>
            <MenuLink href="/campaigns">Campaigns and events</MenuLink>
            <MenuLink href="/team">Team</MenuLink>
            <MenuLink href="/contact">Contact</MenuLink>
          </MenuColumn>
          <MenuColumn title="Help and policy">
            <MenuLink href="/support">Support</MenuLink>
            <MenuLink href="/order-help">Order help</MenuLink>
            <MenuLink href="/shipping">Shipping and delivery</MenuLink>
            <MenuLink href="/returns">Returns and refunds</MenuLink>
            <MenuLink href="/privacy">Privacy policy</MenuLink>
          </MenuColumn>
        </StoreMenu>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <a className="cx-store__nav-direct" href="/blog">
              Blog
            </a>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function StoreMenu({ children, label }: { children: ReactNode; label: string }) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="cx-store__nav-trigger">{label}</NavigationMenuTrigger>
      <NavigationMenuContent className="cx-store__nav-content">
        <div className="cx-store__nav-panel">{children}</div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function MenuFeature({
  description,
  eyebrow,
  href,
  title
}: {
  description: string;
  eyebrow: string;
  href: string;
  title: string;
}) {
  return (
    <NavigationMenuLink asChild>
      <a className="cx-store__nav-feature" href={href}>
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <span>{description}</span>
        <b>
          Explore <ArrowRightIcon />
        </b>
      </a>
    </NavigationMenuLink>
  );
}

function MenuColumn({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="cx-store__nav-column">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

function MenuLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <NavigationMenuLink asChild>
      <a href={href}>{children}</a>
    </NavigationMenuLink>
  );
}
