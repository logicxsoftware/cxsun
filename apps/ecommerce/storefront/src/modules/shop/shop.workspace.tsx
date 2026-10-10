import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShoppingBag,
  MapPin,
  Laptop,
  Monitor,
  Keyboard,
  Phone,
  X,
  Minus,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Button } from "@cxsun/ui/components/button";
import { Input } from "@cxsun/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@cxsun/ui/components/dialog";
import { WorkspaceSelect } from "@cxsun/ui/workspace/select";
import { useShop } from "./shop.hooks";
import { ShopList, ProductImage } from "./shop.list";
import { ShopForm } from "./shop.form";
import { money, type ShopGateway, type ShopProduct, type QuoteReceipt } from "./shop.types";
import "./shop.css";
export function TechmediaStorefront({ gateway }: { gateway: ShopGateway }) {
  const { query, basket, setBasket, add } = useShop(gateway);
  const [search, setSearch] = useState(
    () => new URLSearchParams(location.search).get("search") ?? ""
  );
  const [category, setCategory] = useState(
    () => new URLSearchParams(location.search).get("category") ?? ""
  );
  const [sort, setSort] = useState("featured");
  const [detail, setDetail] = useState<ShopProduct | null>(null);
  const [basketOpen, setBasketOpen] = useState(false);
  const [receipt, setReceipt] = useState<QuoteReceipt | null>(null);
  const data = query.data;
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    history.replaceState(null, "", `${location.pathname}${params.size ? `?${params}` : ""}`);
  }, [search, category]);
  useEffect(() => {
    if (data) document.title = `${data.store.brandName} | Computers & IT`;
  }, [data]);
  const products = useMemo(() => {
    const values = (data?.products ?? []).filter(
      (p) =>
        (!category || p.categoryName === category) &&
        (!search ||
          `${p.title} ${p.description} ${p.sku}`.toLowerCase().includes(search.toLowerCase()))
    );
    return values.sort((a, b) =>
      sort === "price"
        ? (a.offers[0]?.price ?? Infinity) - (b.offers[0]?.price ?? Infinity)
        : sort === "name"
          ? a.title.localeCompare(b.title)
          : Number(b.featured) - Number(a.featured)
    );
  }, [data, category, search, sort]);
  function addToQuote(product: ShopProduct) {
    add(product);
    setReceipt(null);
    setBasketOpen(true);
  }
  function browse(value = "") {
    setCategory(value);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }
  if (query.isPending)
    return (
      <main className="tm-status">
        <ShoppingBag />
        <h1>Opening the store…</h1>
      </main>
    );
  if (!data)
    return (
      <main className="tm-status">
        <Monitor />
        <h1>The store is unavailable</h1>
        <p>{query.error instanceof Error ? query.error.message : "Please try again shortly."}</p>
        <Button onClick={() => void query.refetch()}>Try again</Button>
      </main>
    );
  const hero =
    data.products.find((p) => p.categoryName?.toLowerCase().includes("laptop") && p.imageUrl) ??
    data.products.find((p) => p.imageUrl);
  const count = basket.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <div className="tm-store">
      <a className="tm-skip" href="#catalog">
        Skip to products
      </a>
      <div className="tm-announcement">
        <span>
          <MapPin size={12} />
          {data.store.location || "Computers & IT"}
        </span>
        <span>{data.store.tagline || "Technology for everyday possibilities"}</span>
        <a href={data.store.phone ? `tel:${data.store.phone.replaceAll(" ", "")}` : "#contact"}>
          Let’s talk tech <ArrowUpRight size={12} />
        </a>
      </div>
      <header className="tm-header">
        <a href="/" className="tm-brand" aria-label={`${data.store.brandName} home`}>
          {data.store.logoUrl ? (
            <img src={data.store.logoUrl} alt={data.store.brandName} />
          ) : (
            <>
              <span className="tm-brand-mark">
                t<span>m</span>
              </span>
              <span>
                {data.store.brandName}
                <small>COMPUTERS & IT</small>
              </span>
            </>
          )}
        </a>
        <nav aria-label="Main navigation">
          <button onClick={() => browse()}>Shop all</button>
          <button
            onClick={() =>
              browse(data.categories.find((c) => c.name.toLowerCase().includes("laptop"))?.name)
            }
          >
            Laptops
          </button>
          <a href="#business">For business</a>
        </nav>
        <button
          className="tm-basket-button"
          onClick={() => setBasketOpen(true)}
          aria-label={`Open quote basket, ${count} items`}
        >
          <ShoppingBag size={20} />
          <span>Quote basket</span>
          <b>{count}</b>
        </button>
      </header>
      <main>
        <section className="tm-hero">
          <div className="tm-hero-copy">
            <p className="tm-eyebrow">
              <span className="tm-dot" />
              YOUR NEXT UPGRADE STARTS HERE
            </p>
            <h1>
              Good tech.
              <br />
              Great <em>possibilities.</em>
            </h1>
            <p className="tm-hero-description">
              From your first laptop to your next workspace. Find the right computers, accessories
              and IT essentials with {data.store.brandName}.
            </p>
            <div className="tm-hero-actions">
              <Button className="tm-primary" onClick={() => browse()}>
                Explore the collection <ArrowRight size={17} />
              </Button>
              <a href="#business">
                Build your workspace <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="tm-hero-note">
              <span>PERSONAL. PROFESSIONAL. POSSIBLE.</span>
              <p>Real products. Local advice. A quote made for you.</p>
            </div>
          </div>
          <div className="tm-hero-visual">
            <div className="tm-orbit" />
            <span className="tm-visual-label">WORK. PLAY. CREATE.</span>
            {hero ? (
              <button
                className="tm-hero-product"
                onClick={() => setDetail(hero)}
                aria-label={`Explore ${hero.title}`}
              >
                <ProductImage product={hero} />
              </button>
            ) : (
              <Laptop className="tm-empty-hero" />
            )}
            <div className="tm-hero-product-note">
              <span>{hero?.categoryName || "Computers & IT"}</span>
              <strong>{hero?.title || "Your next setup awaits"}</strong>
              <button
                onClick={() => (hero ? setDetail(hero) : browse())}
                aria-label="Explore featured product"
              >
                <ArrowUpRight size={23} />
              </button>
            </div>
            <span className="tm-visual-number">01 / THE COMPUTER SHOP</span>
          </div>
        </section>
        <section className="tm-categories" aria-label="Shop by category">
          <div>
            <p className="tm-eyebrow">FIND YOUR FIT</p>
            <h2>
              A little of everything.
              <br />
              The right thing for you.
            </h2>
          </div>
          <div className="tm-category-links">
            {data.categories.slice(0, 5).map((c) => (
              <button
                key={c.name}
                className={category === c.name ? "active" : ""}
                onClick={() => browse(c.name)}
              >
                {c.name.toLowerCase().includes("laptop") ? (
                  <Laptop />
                ) : c.name.toLowerCase().includes("keyboard") ||
                  c.name.toLowerCase().includes("mouse") ? (
                  <Keyboard />
                ) : (
                  <Monitor />
                )}
                <span>
                  {c.name}
                  <small>
                    {c.count} {c.count === 1 ? "product" : "products"}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="tm-catalog" id="catalog">
          <div className="tm-section-heading">
            <div>
              <p className="tm-eyebrow">THE TECH EDIT</p>
              <h2>{category || "Discover your next upgrade"}</h2>
            </div>
            <span>{products.length} products · prices confirmed by seller</span>
          </div>
          <div className="tm-tools">
            <label className="tm-search">
              <Search size={18} />
              <Input
                aria-label="Search products"
                placeholder="Search computers, accessories and more"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button aria-label="Clear search" onClick={() => setSearch("")}>
                  <X size={16} />
                </button>
              )}
            </label>
            <WorkspaceSelect
              ariaLabel="Filter category"
              value={category || "all"}
              onValueChange={(v) => setCategory(v === "all" ? "" : v)}
              options={[
                { label: "All categories", value: "all" },
                ...data.categories.map((c) => ({ label: c.name, value: c.name }))
              ]}
            />
            <WorkspaceSelect
              ariaLabel="Sort products"
              value={sort}
              onValueChange={setSort}
              options={[
                { label: "Featured first", value: "featured" },
                { label: "Price: low to high", value: "price" },
                { label: "Name: A–Z", value: "name" }
              ]}
            />
          </div>
          {products.length ? (
            <ShopList products={products} onDetails={setDetail} onAdd={addToQuote} />
          ) : (
            <div className="tm-no-results">
              <Search />
              <h3>No products found</h3>
              <p>Try a different search or browse all categories.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </section>
        <section className="tm-business" id="business">
          <div>
            <p className="tm-eyebrow">MORE THAN A COMPUTER SHOP</p>
            <h2>
              Big ideas deserve
              <br />a better <em>setup.</em>
            </h2>
            <p>
              Setting up an office, upgrading your team or choosing a computer? Tell us what you
              need. We’ll help you put the pieces together.
            </p>
            <Button
              className="tm-light-button"
              onClick={() => {
                setBasketOpen(true);
                setReceipt(null);
              }}
            >
              Put together a quote <ArrowUpRight size={17} />
            </Button>
          </div>
          <div className="tm-business-services">
            {[
              {
                n: "01",
                title: "Computers for your team",
                text: "Explore laptops, desktops and workstations for your everyday work."
              },
              {
                n: "02",
                title: "The complete workspace",
                text: "Find monitors, keyboards and accessories that suit your setup."
              },
              {
                n: "03",
                title: "Talk to a local expert",
                text: "Confirm specifications, availability and support directly with the store."
              }
            ].map((s) => (
              <article key={s.n}>
                <span>{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
                <ArrowUpRight size={20} />
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer id="contact">
        <div className="tm-footer-top">
          <div>
            <h2>
              {data.store.brandName}
              <span>↗</span>
            </h2>
            <p>Your next possibility starts with the right technology.</p>
          </div>
          <div>
            <p className="tm-eyebrow">LET’S TALK TECH</p>
            {data.store.phone && (
              <a href={`tel:${data.store.phone.replaceAll(" ", "")}`}>
                <Phone size={16} />
                {data.store.phone}
              </a>
            )}
            {data.store.email && <a href={`mailto:${data.store.email}`}>{data.store.email}</a>}
            <p>{data.store.location}</p>
          </div>
        </div>
        <div className="tm-footer-bottom">
          <span>
            © {new Date().getFullYear()} {data.store.brandName}
          </span>
          <span>Computers & IT · Quote before you buy</span>
          <a href="#catalog">Back to collection ↑</a>
        </div>
      </footer>
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="tm-detail-dialog sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{detail?.title}</DialogTitle>
            <DialogDescription>
              Review the specifications and request a quote. Availability is confirmed by the
              seller.
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="tm-detail">
              <ProductImage product={detail} />
              <div>
                <p className="tm-eyebrow">{detail.categoryName}</p>
                <p className="tm-specs">
                  {detail.description || "Contact the seller for full specifications."}
                </p>
                <p className="tm-fine">SKU: {detail.sku}</p>
                {detail.offers.map((offer) => (
                  <div className="tm-offer" key={offer.uuid}>
                    <p>Sold by {offer.vendorName}</p>
                    <strong>{money(offer.price, offer.currency)}</strong>
                    <p className="tm-fine">Price and availability to be confirmed</p>
                    <Button
                      className="tm-primary"
                      onClick={() => {
                        add(detail, offer.vendorUuid);
                        setDetail(null);
                        setBasketOpen(true);
                        setReceipt(null);
                      }}
                    >
                      Add to quote <Plus size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={basketOpen} onOpenChange={setBasketOpen}>
        <DialogContent className="tm-basket-dialog sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{receipt ? "Your request is with us" : "Your quote basket"}</DialogTitle>
            <DialogDescription>
              {receipt
                ? "The store will contact you using the details you provided."
                : "Choose your products. We’ll confirm the details before you buy."}
            </DialogDescription>
          </DialogHeader>
          {receipt ? (
            <div className="tm-receipt">
              <CheckCircle2 />
              <h3>Quote request received</h3>
              <p>
                Reference: <strong>{receipt.reference}</strong>
              </p>
              <p>No payment has been collected.</p>
              <Button onClick={() => setBasketOpen(false)}>Continue browsing</Button>
            </div>
          ) : basket.length ? (
            <>
              <div className="tm-basket-items">
                {basket.map((item) => {
                  const p = data.products.find((p) => p.uuid === item.catalogUuid);
                  const offer = p?.offers.find((o) => o.vendorUuid === item.vendorUuid);
                  if (!p) return null;
                  return (
                    <div className="tm-basket-item" key={`${item.catalogUuid}-${item.vendorUuid}`}>
                      <ProductImage product={p} />
                      <div>
                        <strong>{p.title}</strong>
                        <p>
                          {money(offer?.price ?? null, offer?.currency)} · {offer?.vendorName}
                        </p>
                        <div className="tm-quantity">
                          <button
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease ${p.title} quantity`}
                            onClick={() =>
                              setBasket((items) =>
                                items.map((i) =>
                                  i === item ? { ...i, quantity: i.quantity - 1 } : i
                                )
                              )
                            }
                          >
                            <Minus size={14} />
                          </button>
                          <span aria-label={`Quantity for ${p.title}`}>{item.quantity}</span>
                          <button
                            disabled={item.quantity >= 99}
                            aria-label={`Increase ${p.title} quantity`}
                            onClick={() =>
                              setBasket((items) =>
                                items.map((i) =>
                                  i === item ? { ...i, quantity: i.quantity + 1 } : i
                                )
                              )
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        aria-label={`Remove ${p.title}`}
                        onClick={() => setBasket((items) => items.filter((i) => i !== item))}
                      >
                        <X size={17} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <ShopForm
                items={basket}
                gateway={gateway}
                onSuccess={(value) => {
                  setReceipt(value);
                  setBasket([]);
                }}
              />
            </>
          ) : (
            <div className="tm-no-results">
              <ShoppingBag />
              <h3>Your next setup starts here</h3>
              <p>Add products from the collection to request your quote.</p>
              <Button
                className="tm-primary"
                onClick={() => {
                  setBasketOpen(false);
                  browse();
                }}
              >
                Explore products
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
