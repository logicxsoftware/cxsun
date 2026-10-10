import { useState } from "react";
import { ArrowUpRight, Plus, Monitor } from "lucide-react";
import { Button } from "@cxsun/ui/components/button";
import { money, type ShopProduct } from "./shop.types";
const referenceMedia = import.meta.glob<string>("./media/*.webp", {
  eager: true,
  query: "?url",
  import: "default"
});
function productImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "erp1.techmedia.in"
      ? (referenceMedia[`./media/${parsed.pathname.split("/").at(-1)}`] ?? url)
      : url;
  } catch {
    return url;
  }
}
export function ProductImage({
  product,
  className = ""
}: {
  product: ShopProduct;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return product.imageUrl && !failed ? (
    <img
      className={className}
      src={productImageUrl(product.imageUrl)}
      alt={product.imageAlt || product.title}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className={`tm-image-fallback ${className}`}>
      <Monitor aria-hidden="true" />
      <span>Image unavailable</span>
    </div>
  );
}
export function ShopList({
  products,
  onDetails,
  onAdd
}: {
  products: ShopProduct[];
  onDetails: (product: ShopProduct) => void;
  onAdd: (product: ShopProduct) => void;
}) {
  return (
    <div className="tm-products">
      {products.map((product) => (
        <article className="tm-product" key={product.uuid}>
          <button
            className="tm-product-image"
            onClick={() => onDetails(product)}
            aria-label={`View ${product.title}`}
          >
            <ProductImage product={product} />
            {product.featured && <span className="tm-pick">OUR PICK</span>}
            <span className="tm-image-arrow">
              <ArrowUpRight size={18} />
            </span>
          </button>
          <div className="tm-product-body">
            <p className="tm-eyebrow">{product.categoryName || "Computers & IT"}</p>
            <button className="tm-product-title" onClick={() => onDetails(product)}>
              {product.title}
            </button>
            <p className="tm-seller">Sold by {product.offers[0]?.vendorName}</p>
            <div className="tm-product-bottom">
              <strong>
                {money(product.offers[0]?.price ?? null, product.offers[0]?.currency)}
              </strong>
              <Button
                size="icon"
                variant="outline"
                disabled={!product.offers.length}
                onClick={() => onAdd(product)}
                aria-label={`Add ${product.title} to quote`}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
