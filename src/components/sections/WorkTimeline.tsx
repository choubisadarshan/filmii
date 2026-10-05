"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, type WorkCategory } from "@/data/work";

export default function WorkTimeline() {
  return (
    <div
     id="work-categories"
     className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-28">
      <span className="block mb-10 font-mono text-xs uppercase tracking-[0.2em] text-[#E50914] font-semibold">
        Browse by category
      </span>

      <ol className="max-w-3xl">
        {CATEGORIES.map((category, i) => (
          <TimelineItem
            key={category.slug}
            category={category}
            index={i}
            isLast={i === CATEGORIES.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

function TimelineItem({
  category,
  index,
  isLast,
}: {
  category: WorkCategory;
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(false);

  // 0 when this item's top reaches the middle of the screen,
  // 1 when its bottom reaches the middle of the screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 50%", "end 50%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(v > 0));

  return (
    <li ref={ref} className={`relative pl-14 ${isLast ? "" : "pb-20 sm:pb-24"}`}>
      {/* grey track + red fill that grows while you scroll */}
      {!isLast && (
        <>
          <span className="absolute left-[11px] top-7 -bottom-1 w-[2px] bg-white/10" />
          <motion.span
            style={{ scaleY: fill }}
            className="absolute left-[11px] top-7 -bottom-1 w-[2px] origin-top bg-[#E50914]"
          />
        </>
      )}

      {/* dot */}
      <span
        className={`absolute left-0 top-1 size-6 rounded-full border-2 transition-all duration-300 ${
          active
            ? "border-[#E50914] bg-[#E50914] shadow-[0_0_18px_rgba(229,9,20,0.6)]"
            : "border-white/15 bg-[#161616]"
        }`}
      />

      <span className="font-mono text-xs tracking-widest text-neutral-500">
        0{index + 1}
      </span>

      <Link
        href={`/work/${category.slug}`}
        className="group mt-1 flex items-center gap-3 w-fit"
      >
        <h3
          className={`font-display text-4xl sm:text-6xl uppercase tracking-wide transition-colors duration-300 group-hover:text-[#E50914] ${
            active ? "text-white" : "text-neutral-600"
          }`}
        >
          {category.title}
        </h3>
        <ArrowUpRight className="size-6 sm:size-8 text-neutral-500 transition-all duration-300 group-hover:text-[#E50914] group-hover:translate-x-1 group-hover:-translate-y-1" />
      </Link>

      <p
        className={`mt-3 max-w-md text-sm sm:text-base font-light leading-relaxed transition-colors duration-300 ${
          active ? "text-neutral-400" : "text-neutral-600"
        }`}
      >
        {category.tagline}
      </p>
    </li>
  );
}
