"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const slides = [
  { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920", alt: "Fryzjer" },
  { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1920", alt: "SPA" },
  { src: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1920", alt: "Paznokcie" },
  { src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1920", alt: "Fotografia" },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
          sizes="100vw"
        />
      ))}
      <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
