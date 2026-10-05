import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory } from "@/data/work";
import CategoryGallery from "@/components/sections/CategoryGallery";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const data = getCategory(category);
  return { title: data ? `${data.title} | onsetproduction` : "Work | onsetproduction" };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const data = getCategory(category);
  if (!data) notFound();
  return <CategoryGallery category={data} />;
}
