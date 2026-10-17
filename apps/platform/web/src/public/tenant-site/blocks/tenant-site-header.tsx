import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useTenantSite } from "../tenant-site.context";
import type { TenantPublicPageKey } from "../tenant-site.types";
import { TenantSiteLogo } from "./tenant-site-logo";

export function TenantSiteHeader({ activePage }: { activePage: TenantPublicPageKey }) {
  const { authenticated, portal, signOut } = useTenantSite();
  const [productsOpen, setProductsOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <nav className="tenant-portal-nav" aria-label="CODEXSUN product navigation">
      <Link className="tenant-portal-brand" to="/" aria-label={`${portal.brandName} home`}>
        <TenantSiteLogo
          brandName={portal.brandName}
          className="tenant-portal-mark"
          logoDarkUrl={portal.logoDarkUrl}
          logoUrl={portal.logoUrl}
        />
        <span>
          <strong>{portal.brandName}</strong>
          <small>Business Operating Platform</small>
        </span>
      </Link>
      <div className="tenant-portal-menu">
        <button
          type="button"
          aria-expanded={productsOpen}
          aria-controls="tenant-product-mega-menu"
          aria-current={activePage === "workspace" ? "page" : undefined}
          onClick={() => setProductsOpen((open) => !open)}
        >
          Product
        </button>
        <div
          id="tenant-product-mega-menu"
          className="tenant-product-mega-menu"
          data-open={productsOpen}
          role="region"
          aria-label="Explore the platform"
          aria-hidden={!productsOpen}
        >
          <Link to="/workspace" tabIndex={productsOpen ? 0 : -1} onClick={() => setProductsOpen(false)}>
            <span>Connected workspace</span>
            <strong>Product</strong>
            <small>See the operating platform and its connected apps.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/features" tabIndex={productsOpen ? 0 : -1} onClick={() => setProductsOpen(false)}>
            <span>Workflows and tools</span>
            <strong>Features</strong>
            <small>Explore the capabilities built for everyday business work.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/security" tabIndex={productsOpen ? 0 : -1} onClick={() => setProductsOpen(false)}>
            <span>Trust and control</span>
            <strong>Security</strong>
            <small>Review tenant isolation, access and operational safeguards.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <Link to="/blog" aria-current={activePage === "blog" ? "page" : undefined}>
          Blog
        </Link>
        <Link to="/updates" aria-current={activePage === "updates" ? "page" : undefined}>
          Updates
        </Link>
        {portal.publicSiteUrl ? (
          <a href={portal.publicSiteUrl}>
            Public site <ExternalLink />
          </a>
        ) : null}
      </div>
      <div className="tenant-portal-session-actions">
        {authenticated ? (
          <>
            <a className="tenant-portal-login" href="/app/">
              Dashboard <ArrowRight />
            </a>
            <button className="tenant-portal-logout" type="button" onClick={() => void signOut()}>
              Log out <LogOut />
            </button>
          </>
        ) : (
          <a className="tenant-portal-login" href={portal.loginPath}>
            Log in <ArrowRight />
          </a>
        )}
      </div>
    </nav>
  );
}
