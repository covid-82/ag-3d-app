import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfiguratorShell } from "@/components/configurator/ConfiguratorShell";
import { KIND_SPECS, makeInitialConfig } from "@/lib/configurator/kinds";
import { sanitize } from "@/lib/configurator/rules";
import { decodeConfig } from "@/lib/configurator/share";
import { getProductBySlug, listMaterials } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ d?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Konfigurator" };
  return {
    title: `Konfigurator ${product.name}`,
    description: `Atur ukuran, isi, dan material ${product.name} secara langsung dalam 3D.`,
    robots: { index: false, follow: true },
  };
}

export default async function ConfiguratorPage({ params, searchParams }: Props) {
  const [{ slug }, { d }] = await Promise.all([params, searchParams]);
  const [product, materials] = await Promise.all([getProductBySlug(slug), listMaterials()]);
  if (!product) notFound();

  const spec = KIND_SPECS[product.kind];
  const shared = decodeConfig(d);
  const base = makeInitialConfig(spec, product, materials);
  const initial = shared ? sanitize(spec, product.limits, { ...base, ...shared }).config : base;

  return <ConfiguratorShell product={product} materials={materials} initial={initial} />;
}
