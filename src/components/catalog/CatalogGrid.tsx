"use client";

import { useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Quick3DModal } from "@/components/catalog/Quick3DModal";
import type { MaterialOption, ProductData } from "@/lib/configurator/types";

interface Props {
  products: ProductData[];
  materials: MaterialOption[];
}

export function CatalogGrid({ products, materials }: Props) {
  const [activeProduct, setActiveProduct] = useState<ProductData | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            materials={materials}
            onQuick3D={() => setActiveProduct(p)}
          />
        ))}
      </div>

      {activeProduct && (
        <Quick3DModal
          product={activeProduct}
          materials={materials}
          onClose={() => setActiveProduct(null)}
        />
      )}
    </>
  );
}
