"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Film } from "lucide-react";
import FilmGrain from "@/components/fx/FilmGrain";
import RedSpotlight from "@/components/fx/RedSpotlight";
import CustomCursor from "@/components/fx/CustomCursor";
import { CATEGORIES, type WorkCategory, type WorkItem } from "@/data/work";

export default function CategoryGallery({ category }: { category: WorkCategory }) {
  const index = CATEGORIES.findIndex((c) => c.slug === category.slug);
  const next = CATEGORIES[(index + 1) % CATEGORIES.length];

  return (
    <>
      {/* these 3 are mounted only on the home page today, so add them here too */}
      <FilmGrain />
      <RedSpotlight />
      <CustomCursor />

      <div className="relative min-h-screen bg-[#050505] text-white">
        <header className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5 flex items-center justify-between">
            <Link href="/" className="font-display text-2xl sm:text-3xl tracking-widest uppercase">
              ONSET <span className="text-[#E50914]">PRODUCTION</span>
            </Link>
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-4" /> BACK TO WORK
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-24">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E50914] font-semibold">
            0{index + 1} / {category.title}
          </span>
          <h1 className="mt-3 font-display text-6xl sm:text-8xl uppercase tracking-wide">
            {category.title}
          </h1>
          <p className="mt-4 max-w-xl text-neutral-400 font-light leading-relaxed">
            {category.tagline}
          </p>

          {category.items.length === 0 ? (
            <div className="mt-16 rounded-xl border border-white/10 bg-[#0A0A0A] p-12 text-center font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
              Projects coming soon
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {category.items.map((item) => (
                <WorkCard key={item.id} item={item} />
              ))}
            </div>
          )}

          <Link
            href={`/work/${next.slug}`}
            className="group mt-24 flex items-center justify-between border-t border-white/10 pt-8"
          >
            <span className="font-mono text-xs tracking-widest text-neutral-500">NEXT CATEGORY</span>
            <span className="flex items-center gap-3 font-display text-3xl sm:text-5xl uppercase group-hover:text-[#E50914] transition-colors">
              {next.title} <ArrowRight className="size-6 sm:size-8" />
            </span>
          </Link>
        </main>
      </div>
    </>
  );
}

function WorkCard({ item }: { item: WorkItem }) {
  return (
    <div>
      {item.videoSrc ? (
        <video
          src={item.videoSrc}
          poster={item.posterSrc}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-xl border border-white/10 bg-black object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`${item.title} preview coming soon`}
          className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#0A0A0A] text-neutral-500"
        >
          <Film className="size-8 text-[#E50914]/80" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-[0.18em]">Preview coming soon</span>
        </div>
      )}
      <h3 className="mt-4 font-display text-xl sm:text-2xl tracking-wide uppercase">{item.title}</h3>
      <p className="mt-1 font-mono text-sm tracking-wider text-neutral-500">{item.subtitle}</p>
    </div>
  );
}
