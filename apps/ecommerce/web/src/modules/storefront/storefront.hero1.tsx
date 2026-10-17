import { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { StorefrontSlider } from "./storefront.types";
import "./storefront.hero1.css";

/**
 * Full-cover banner showcase slider.
 *
 * Renders edge-to-edge banners from the backend API with:
 * - Smooth crossfade transitions between slides
 * - Glassmorphism navigation arrows (visible on hover)
 * - Animated pagination dots with progress indicator
 * - Auto-advance every 6.5s (pauses on hover / touch)
 * - Touch swipe support for mobile
 * - Keyboard navigation (← / →)
 * - Each banner is a clickable link to its `actionUrl`
 *
 * No text overlay — the banner images speak for themselves.
 */
export function HeroSlider({ slides }: { slides: StorefrontSlider[] }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Guard against empty slides
  const activeSlides = slides.length > 0 ? slides : fallbackHeroSlides;
  const slideCount = activeSlides.length;

  // Auto-advance every 6.5s, pause on hover
  useEffect(() => {
    if (slideCount < 2 || isPaused) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slideCount);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slideCount, isPaused]);

  const prevSlide = () => setActive((prev) => (prev - 1 + slideCount) % slideCount);
  const nextSlide = () => setActive((prev) => (prev + 1) % slideCount);

  // Swipe handling for touch devices
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    setIsPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touch = e.changedTouches[0];
    if (touch) {
      const diff = touchStartX.current - touch.clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Banner showcase"
      aria-roledescription="carousel"
      className={`cx-hero-section${isPaused ? " cx-hero--paused" : ""}`}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      {/* Slide Track (crossfade stack) */}
      <div className="cx-hero-track">
        {activeSlides.map((slide, index) => (
          <div
            aria-hidden={index !== active}
            className={`cx-hero-slide${index === active ? " cx-hero-slide--active" : ""}`}
            key={slide.sliderCode || index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slideCount}`}
          >
            {slide.actionUrl ? (
              <a
                className="cx-hero-link"
                href={slide.actionUrl}
                aria-label={slide.title || `Banner ${index + 1}`}
                tabIndex={index === active ? 0 : -1}
              >
                <img
                  alt={slide.imageAlt || slide.title || `Banner ${index + 1}`}
                  className="cx-hero-banner"
                  decoding={index === 0 ? "sync" : "async"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  src={slide.imageUrl}
                />
              </a>
            ) : (
              <img
                alt={slide.imageAlt || slide.title || `Banner ${index + 1}`}
                className="cx-hero-banner"
                decoding={index === 0 ? "sync" : "async"}
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                src={slide.imageUrl}
              />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slideCount > 1 ? (
        <>
          <button
            aria-label="Previous banner"
            className="cx-hero-arrow cx-hero-arrow--prev"
            onClick={prevSlide}
            type="button"
          >
            <ArrowLeftIcon aria-hidden="true" />
          </button>
          <button
            aria-label="Next banner"
            className="cx-hero-arrow cx-hero-arrow--next"
            onClick={nextSlide}
            type="button"
          >
            <ArrowRightIcon aria-hidden="true" />
          </button>
        </>
      ) : null}

      {/* Pagination Dots */}
      {slideCount > 1 ? (
        <div aria-label="Choose banner" className="cx-hero-pagination">
          {activeSlides.map((item, index) => (
            <button
              aria-label={`Show banner ${index + 1}${item.title ? `: ${item.title}` : ""}`}
              aria-current={index === active ? "true" : undefined}
              className={`cx-hero-dot${index === active ? " cx-hero-dot--active" : ""}`}
              key={item.sliderCode || index}
              onClick={() => setActive(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* Fallback only used if backend API returns an empty array */
const fallbackHeroSlides: StorefrontSlider[] = [
  {
    actionLabel: "Explore Audio",
    actionUrl: "/shop?category=Audio",
    description: "",
    displayOrder: 1,
    eyebrow: "",
    imageAlt: "Audio & Headphones Banner",
    imageUrl: "/banners/hero_banner_audio.jpg",
    linkedItem: null,
    sliderCode: "SLIDER-AUDIO",
    title: "Studio-Grade Audio"
  },
  {
    actionLabel: "Shop Laptops",
    actionUrl: "/shop?category=Laptops",
    description: "",
    displayOrder: 2,
    eyebrow: "",
    imageAlt: "Laptops & Computing Banner",
    imageUrl: "/banners/hero_banner_laptops.jpg",
    linkedItem: null,
    sliderCode: "SLIDER-LAPTOPS",
    title: "Next-Gen Computing"
  },
  {
    actionLabel: "Shop Smartphones",
    actionUrl: "/shop?category=Smartphones",
    description: "",
    displayOrder: 3,
    eyebrow: "",
    imageAlt: "Smartphones & Deals Banner",
    imageUrl: "/banners/hero_banner_smartphones.jpg",
    linkedItem: null,
    sliderCode: "SLIDER-SMARTPHONES",
    title: "Festive Smartphone Deals"
  }
];
