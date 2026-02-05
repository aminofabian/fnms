"use client";

import { useState, useEffect, useCallback } from "react";
import { useHomeFilterStore } from "@/stores/home-filter-store";
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
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
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

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    productsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface ProductFilterBarProps {
    initialProducts: Product[];
    categories: Category[];
    initialPagination?: PaginationData;
}

export function ProductFilterBar({
    initialProducts,
    categories,
    initialPagination,
}: ProductFilterBarProps) {
    const categorySlug = useHomeFilterStore((s) => s.categorySlug);
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [gridSize, setGridSize] = useState<"compact" | "comfortable">("comfortable");
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [pagination, setPagination] = useState<PaginationData>(
        initialPagination || {
            currentPage: 1,
            totalPages: 1,
            totalProducts: initialProducts.length,
            productsPerPage: 40,
            hasNextPage: false,
            hasPrevPage: false,
        }
    );
    const [isLoading, setIsLoading] = useState(false);

    // Base filter buttons
    const baseFilters: FilterButton[] = [
        {
            id: "all",
            label: "All Products",
            icon: <Grid3X3 className="h-3 w-3" />,
            gradient: "from-slate-500 to-slate-700",
            glowColor: "rgba(100, 116, 139, 0.4)",
            description: "Browse everything",
        },
        {
            id: "deals",
            label: "Hot Deals",
            icon: <Flame className="h-3 w-3" />,
            gradient: "from-orange-500 to-red-600",
            glowColor: "rgba(249, 115, 22, 0.5)",
            description: "Save big today",
        },
        {
            id: "new",
            label: "Just Arrived",
            icon: <Sparkles className="h-3 w-3" />,
            gradient: "from-violet-500 to-purple-600",
            glowColor: "rgba(139, 92, 246, 0.5)",
            description: "Fresh additions",
        },
        {
            id: "popular",
            label: "Trending",
            icon: <TrendingUp className="h-3 w-3" />,
            gradient: "from-pink-500 to-rose-600",
            glowColor: "rgba(236, 72, 153, 0.5)",
            description: "Customer favorites",
        },
        {
            id: "inStock",
            label: "Available Now",
            icon: <Package className="h-3 w-3" />,
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
                icon: <Leaf className="h-3 w-3" />,
            },
            {
                gradient: "from-amber-500 to-yellow-600",
                glowColor: "rgba(245, 158, 11, 0.5)",
                icon: <Star className="h-3 w-3" />,
            },
            {
                gradient: "from-cyan-500 to-teal-600",
                glowColor: "rgba(6, 182, 212, 0.5)",
                icon: <Tag className="h-3 w-3" />,
            },
            {
                gradient: "from-indigo-500 to-blue-600",
                glowColor: "rgba(99, 102, 241, 0.5)",
                icon: <Clock className="h-3 w-3" />,
            },
            {
                gradient: "from-fuchsia-500 to-pink-600",
                glowColor: "rgba(192, 38, 211, 0.5)",
                icon: <Sparkles className="h-3 w-3" />,
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

    // Fetch products from API
    const fetchProducts = useCallback(async (page: number, filter: FilterType) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                filter: filter,
            });

            // If filter is a category slug
            const isBaseFilter = ["all", "deals", "new", "popular", "inStock", "lowStock"].includes(filter);
            if (!isBaseFilter) {
                params.set("filter", "all");
                params.set("category", filter);
            }

            const response = await fetch(`/api/products/paginated?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setProducts(data.products);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sync activeFilter when category is selected from sidebar
    useEffect(() => {
        if (categorySlug) {
            setActiveFilter(categorySlug);
            setCurrentPage(1);
        } else if (categories.some((c) => c.slug === activeFilter)) {
            setActiveFilter("all");
            setCurrentPage(1);
        }
    }, [categorySlug]);

    // Fetch when filter or page changes
    useEffect(() => {
        fetchProducts(currentPage, activeFilter);
    }, [currentPage, activeFilter, fetchProducts]);

    // Reset to page 1 when filter changes
    const setCategory = useHomeFilterStore((s) => s.setCategory);
    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        setCurrentPage(1);
        // Clear sidebar selection when user picks a non-category filter
        const isCategory = categories.some((c) => c.slug === filter);
        if (!isCategory) setCategory(null);
    };

    const activeFilterData = allFilters.find((f) => f.id === activeFilter);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5;
        const totalPages = pagination.totalPages;

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const startIndex = (currentPage - 1) * pagination.productsPerPage + 1;
    const endIndex = Math.min(currentPage * pagination.productsPerPage, pagination.totalProducts);

    const showFilterUI = !categorySlug;

    return (
        <div className="space-y-6">
            {showFilterUI && (
            <>
            {/* Filter Section Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-[8px] font-bold uppercase tracking-wide text-foreground sm:text-[9px]">
                        🛒 Shop Our Collection
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {pagination.totalProducts} products available
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
                                onClick={() => handleFilterChange(filter.id)}
                                disabled={isLoading}
                                className={`group relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[9px] font-semibold uppercase tracking-wide transition-all duration-200 sm:px-4 sm:py-2 sm:text-[10px] ${isActive
                                    ? "scale-[1.01] text-white shadow-md"
                                    : "bg-white/90 text-foreground shadow-sm ring-1 ring-black/5 hover:ring-black/10"
                                    } ${isLoading ? "opacity-70 cursor-wait" : ""}`}
                                style={{
                                    boxShadow: isActive
                                        ? `0 2px 8px -2px ${filter.glowColor}`
                                        : undefined,
                                }}
                                aria-pressed={isActive}
                            >
                                {/* Gradient background for active state */}
                                {isActive && (
                                    <div
                                        className={`absolute inset-0 rounded-lg bg-gradient-to-r ${filter.gradient}`}
                                        style={{ zIndex: -1 }}
                                    />
                                )}

                                <span
                                    className={`transition-transform duration-150 ${isActive ? "" : "group-hover:scale-105"}`}
                                >
                                    {filter.icon}
                                </span>

                                <span className="whitespace-nowrap">{filter.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Scroll hint gradients for mobile */}
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#9ACD32] to-transparent sm:hidden" />
            </div>

            </>
            )}

            {/* Active Filter Description Badge */}
            {showFilterUI && activeFilterData?.description && activeFilter !== "all" && (
                <div className="flex items-center gap-2 animate-fade-in-up">
                    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-xs font-medium text-white shadow-md ${activeFilterData.gradient}`}>
                        {activeFilterData.icon}
                        <span>{activeFilterData.description}</span>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/90 px-6 py-4 shadow-lg ring-1 ring-black/5">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Loading products...</span>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {!isLoading && (
                <div
                    className={`transition-all duration-300 ${gridSize === "compact" ? "product-grid-compact" : ""}`}
                >
                    {products.length > 0 ? (
                        <ProductGrid products={products} />
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
                                onClick={() => handleFilterChange("all")}
                                className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95"
                            >
                                View All Products
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && pagination.totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-6">
                    {/* Page Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">
                            Showing {startIndex}-{endIndex}
                        </span>
                        <span>of</span>
                        <span className="font-bold text-foreground">{pagination.totalProducts}</span>
                        <span>products</span>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* First Page */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={!pagination.hasPrevPage || isLoading}
                            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:bg-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                            aria-label="First page"
                        >
                            <ChevronsLeft className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground group-disabled:text-muted-foreground" />
                        </button>

                        {/* Previous Page */}
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={!pagination.hasPrevPage || isLoading}
                            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:bg-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground group-disabled:text-muted-foreground" />
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, idx) => (
                                typeof page === "number" ? (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentPage(page)}
                                        disabled={isLoading}
                                        className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 ${currentPage === page
                                                ? "bg-gradient-to-br from-primary to-orange-600 text-white shadow-lg scale-105"
                                                : "bg-white/80 text-foreground shadow-sm ring-1 ring-black/5 hover:bg-white hover:shadow-md hover:scale-[1.02]"
                                            }`}
                                        style={{
                                            boxShadow: currentPage === page
                                                ? "0 8px 25px -5px rgba(234, 88, 12, 0.4)"
                                                : undefined,
                                        }}
                                        aria-label={`Page ${page}`}
                                        aria-current={currentPage === page ? "page" : undefined}
                                    >
                                        {page}
                                        {currentPage === page && (
                                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                                            </span>
                                        )}
                                    </button>
                                ) : (
                                    <span key={idx} className="flex h-10 w-6 items-center justify-center text-muted-foreground">
                                        •••
                                    </span>
                                )
                            ))}
                        </div>

                        {/* Next Page */}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                            disabled={!pagination.hasNextPage || isLoading}
                            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:bg-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground group-disabled:text-muted-foreground" />
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => setCurrentPage(pagination.totalPages)}
                            disabled={!pagination.hasNextPage || isLoading}
                            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 transition-all duration-200 hover:bg-white hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
                            aria-label="Last page"
                        >
                            <ChevronsRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground group-disabled:text-muted-foreground" />
                        </button>
                    </div>

                    {/* Quick Jump */}
                    {pagination.totalPages > 5 && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Go to page:</span>
                            <input
                                type="number"
                                min={1}
                                max={pagination.totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                    const page = parseInt(e.target.value);
                                    if (page >= 1 && page <= pagination.totalPages) {
                                        setCurrentPage(page);
                                    }
                                }}
                                disabled={isLoading}
                                className="w-16 rounded-lg bg-white/80 px-3 py-2 text-center text-sm font-medium shadow-sm ring-1 ring-black/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                            />
                            <span className="text-muted-foreground">of {pagination.totalPages}</span>
                        </div>
                    )}
                </div>
            )}

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
