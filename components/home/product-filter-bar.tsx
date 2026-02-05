"use client";

import { useState, useMemo } from "react";
import {
    Sparkles,
    Flame,
    Tag,
    Package,
    Leaf,
    Clock,
    TrendingUp,
    Star,
    Grid3X3,
    LayoutGrid,
} from "lucide-react";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { ProductGrid } from "./product-grid";

type FilterType =
    | "all"
    | "deals"
    | "new"
    | "popular"
    | "inStock"
    | "lowStock"
    | string; // category slugs

interface FilterButton {
    id: FilterType;
    label: string;
    icon: React.ReactNode;
    gradient: string;
    glowColor: string;
    description?: string;
}

interface ProductFilterBarProps {
    products: Product[];
    categories: Category[];
}

export function ProductFilterBar({
    products,
    categories,
}: ProductFilterBarProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [gridSize, setGridSize] = useState<"compact" | "comfortable">(
        "comfortable"
    );

    // Base filter buttons
    const baseFilters: FilterButton[] = [
        {
            id: "all",
            label: "All Products",
            icon: <Grid3X3 className="h-4 w-4" />,
            gradient: "from-slate-500 to-slate-700",
            glowColor: "rgba(100, 116, 139, 0.4)",
            description: "Browse everything",
        },
        {
            id: "deals",
            label: "Hot Deals",
            icon: <Flame className="h-4 w-4" />,
            gradient: "from-orange-500 to-red-600",
            glowColor: "rgba(249, 115, 22, 0.5)",
            description: "Save big today",
        },
        {
            id: "new",
            label: "Just Arrived",
            icon: <Sparkles className="h-4 w-4" />,
            gradient: "from-violet-500 to-purple-600",
            glowColor: "rgba(139, 92, 246, 0.5)",
            description: "Fresh additions",
        },
        {
            id: "popular",
            label: "Trending",
            icon: <TrendingUp className="h-4 w-4" />,
            gradient: "from-pink-500 to-rose-600",
            glowColor: "rgba(236, 72, 153, 0.5)",
            description: "Customer favorites",
        },
        {
            id: "inStock",
            label: "Available Now",
            icon: <Package className="h-4 w-4" />,
            gradient: "from-emerald-500 to-green-600",
            glowColor: "rgba(16, 185, 129, 0.5)",
            description: "Ready to ship",
        },
    ];

    // Category-based filter buttons with dynamic colors
    const categoryColors: Array<{
        gradient: string;
        glowColor: string;
        icon: React.ReactNode;
    }> = [
            {
                gradient: "from-lime-500 to-green-600",
                glowColor: "rgba(132, 204, 22, 0.5)",
                icon: <Leaf className="h-4 w-4" />,
            },
            {
                gradient: "from-amber-500 to-yellow-600",
                glowColor: "rgba(245, 158, 11, 0.5)",
                icon: <Star className="h-4 w-4" />,
            },
            {
                gradient: "from-cyan-500 to-teal-600",
                glowColor: "rgba(6, 182, 212, 0.5)",
                icon: <Tag className="h-4 w-4" />,
            },
            {
                gradient: "from-indigo-500 to-blue-600",
                glowColor: "rgba(99, 102, 241, 0.5)",
                icon: <Clock className="h-4 w-4" />,
            },
            {
                gradient: "from-fuchsia-500 to-pink-600",
                glowColor: "rgba(192, 38, 211, 0.5)",
                icon: <Sparkles className="h-4 w-4" />,
            },
        ];

    // Generate category filters dynamically
    const categoryFilters: FilterButton[] = categories.slice(0, 5).map((cat, idx) => ({
        id: cat.slug,
        label: cat.name,
        icon: categoryColors[idx % categoryColors.length].icon,
        gradient: categoryColors[idx % categoryColors.length].gradient,
        glowColor: categoryColors[idx % categoryColors.length].glowColor,
        description: cat.description || undefined,
    }));

    const allFilters = [...baseFilters, ...categoryFilters];

    // Filter products based on active filter
    const filteredProducts = useMemo(() => {
        switch (activeFilter) {
            case "all":
                return products;
            case "deals":
                return products.filter(
                    (p) => p.compareAtCents && p.compareAtCents > p.priceCents
                );
            case "new":
                // Products created in last 7 days
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return products.filter((p) => new Date(p.createdAt) >= oneWeekAgo);
            case "popular":
                // For now, just show products with discounts as "popular" - you can enhance this with real analytics
                return products.filter(
                    (p) =>
                        p.compareAtCents && p.compareAtCents > p.priceCents
                ).slice(0, 12);
            case "inStock":
                return products.filter((p) => p.stockQuantity > 0);
            case "lowStock":
                return products.filter(
                    (p) => p.stockQuantity > 0 && p.stockQuantity <= 10
                );
            default:
                // Category filter
                const category = categories.find((c) => c.slug === activeFilter);
                if (category) {
                    return products.filter((p) => p.categoryId === category.id);
                }
                return products;
        }
    }, [products, categories, activeFilter]);

    const activeFilterData = allFilters.find((f) => f.id === activeFilter);

    return (
        <div className="space-y-6">
            {/* Filter Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                        🛒 Shop Our Collection
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {filteredProducts.length} products available
                        {activeFilter !== "all" && activeFilterData && (
                            <span className="ml-1">
                                in <span className="font-medium">{activeFilterData.label}</span>
                            </span>
                        )}
                    </p>
                </div>

                {/* Grid Size Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        View:
                    </span>
                    <div className="flex rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-black/5">
                        <button
                            onClick={() => setGridSize("compact")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${gridSize === "compact"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            aria-label="Compact grid view"
                        >
                            <Grid3X3 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Compact</span>
                        </button>
                        <button
                            onClick={() => setGridSize("comfortable")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${gridSize === "comfortable"
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                            aria-label="Comfortable grid view"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Comfy</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Buttons - Horizontally Scrollable */}
            <div className="relative -mx-4 px-4 sm:-mx-0 sm:px-0">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:flex-wrap sm:gap-3">
                    {allFilters.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`group relative flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out sm:px-5 sm:py-3 ${isActive
                                        ? "scale-[1.02] text-white shadow-lg"
                                        : "bg-white/90 text-foreground shadow-sm ring-1 ring-black/5 hover:scale-[1.01] hover:shadow-md hover:ring-black/10"
                                    }`}
                                style={{
                                    background: isActive
                                        ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                                        : undefined,
                                    boxShadow: isActive
                                        ? `0 10px 40px -10px ${filter.glowColor}, 0 4px 6px -4px rgba(0,0,0,0.1)`
                                        : undefined,
                                }}
                                aria-pressed={isActive}
                            >
                                {/* Gradient background for active state */}
                                {isActive && (
                                    <div
                                        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${filter.gradient}`}
                                        style={{ zIndex: -1 }}
                                    />
                                )}

                                {/* Animated glow effect for active button */}
                                {isActive && (
                                    <div
                                        className="absolute inset-0 -z-10 animate-pulse rounded-2xl opacity-50 blur-xl"
                                        style={{
                                            background: `linear-gradient(135deg, ${filter.glowColor}, transparent)`,
                                        }}
                                    />
                                )}

                                {/* Icon with micro-animation */}
                                <span
                                    className={`transition-transform duration-200 ${isActive ? "animate-bounce" : "group-hover:scale-110"
                                        }`}
                                    style={{ animationDuration: isActive ? "1s" : undefined }}
                                >
                                    {filter.icon}
                                </span>

                                {/* Label */}
                                <span className="whitespace-nowrap">{filter.label}</span>

                                {/* Active indicator dot */}
                                {isActive && (
                                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                                        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                                    </span>
                                )}

                                {/* Hover shine effect */}
                                <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
                                    <div className="absolute -inset-full h-full w-1/2 rotate-12 transform bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 ease-out group-hover:translate-x-[200%] group-hover:opacity-100" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Scroll hint gradients for mobile */}
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#9ACD32] to-transparent sm:hidden" />
            </div>

            {/* Active Filter Description Badge */}
            {activeFilterData?.description && activeFilter !== "all" && (
                <div className="flex items-center gap-2 animate-fade-in-up">
                    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-xs font-medium text-white shadow-md ${activeFilterData.gradient}`}>
                        {activeFilterData.icon}
                        <span>{activeFilterData.description}</span>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            <div
                className={`transition-all duration-300 ${gridSize === "compact" ? "product-grid-compact" : ""
                    }`}
            >
                {filteredProducts.length > 0 ? (
                    <ProductGrid products={filteredProducts} />
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-white/50 py-16 text-center shadow-inner">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg">
                            <Package className="h-10 w-10" aria-hidden />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">
                            No Products Found
                        </h3>
                        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                            Try a different filter or check back soon for new arrivals!
                        </p>
                        <button
                            onClick={() => setActiveFilter("all")}
                            className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95"
                        >
                            View All Products
                        </button>
                    </div>
                )}
            </div>

            {/* Styling for compact grid */}
            <style jsx global>{`
        .product-grid-compact .grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        @media (min-width: 640px) {
          .product-grid-compact .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 768px) {
          .product-grid-compact .grid {
            grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1024px) {
          .product-grid-compact .grid {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          }
        }
        @media (min-width: 1280px) {
          .product-grid-compact .grid {
            grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
        </div>
    );
}
