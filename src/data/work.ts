export interface WorkItem {
  id: string;
  title: string;
  subtitle: string;
  /** Put the file in /public and use e.g. "/videos/my-clip.mp4". Leave empty for "coming soon". */
  videoSrc?: string;
  posterSrc?: string;
}

export interface WorkCategory {
  slug: string; // used in the URL: /work/<slug>
  title: string;
  tagline: string;
  items: WorkItem[];
}

export const CATEGORIES: WorkCategory[] = [
  {
    slug: "music-video",
    title: "Music Video",
    tagline: "High-energy visuals shot, graded and delivered for artists.",
    items: [
      { id: "mv-1", title: "Client Project 01", subtitle: "Music Video · 2025" },
    ],
  },
  {
    slug: "film",
    title: "Film",
    tagline: "Short films and cinematic storytelling, from script to screen.",
    items: [],
  },
  {
    slug: "ep-visualization",
    title: "EP Visualization",
    tagline: "Visual worlds built around an artist's EP release.",
    items: [
      { id: "ep-1", title: "Client Project 02", subtitle: "EP Visualizer · 2025" },
    ],
  },
  {
    slug: "brand-story",
    title: "Brand Story",
    tagline: "Commercials and brand films that make people remember you.",
    items: [],
  },
];

export const getCategory = (slug: string) =>
  CATEGORIES.find((c) => c.slug === slug);
