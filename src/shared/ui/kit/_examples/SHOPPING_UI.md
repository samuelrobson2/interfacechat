# Example: Shopping UI (Uniqlo-style)

An e-commerce product listing mini-app with search, category filters, a product card grid, and a featured promotion card.

## Components Used

`Card` (`ghost` / `outlined` / `filled`, `shape="rounded"`, `orientation="horizontal"`), `CardImage` (`ratio="portrait"` / `ratio="square"`, `shape="rounded"`), `CardContent`, `Text`, `TruncatedText`, `Badge` (`sm` / `md`, `default` / `ghost` / `neutral` / `accent`), `Button` (`ghost` / `black` / `tertiary` / `secondary` / `link`, `size="icon-sm"` / `40` / `48`, `radius="rounded"`), `Input` (`variant="labeled"`, `fill="outlined"`), `InteractiveBadge` (`neutral` / `accent`, `isSelected`), `Separator`.

## Key Patterns

- **Card variant diversity**: `ghost` for product cards, `outlined` + `shape="rounded"` + `orientation="horizontal"` for featured promo, `filled` + `shape="rounded"` for "You Might Also Like" carousel items
- **CardImage** with `ratio="portrait"` for tall product images and `ratio="square"` for compact carousel thumbnails
- **InteractiveBadge** with `isSelected` for category filter chips (color `neutral`), plus `accent` color for filters button
- **Button variant diversity**: `ghost` icon buttons in header, `black` CTA on promo, `tertiary` secondary action, `link` for "View all", `secondary` + `radius="rounded"` for load more
- **Image hover zoom**: `group` + `group-hover:scale-105` on product card
- **Wishlist heart** button overlaid on product image
- Color swatches as styled `<div>` elements using design tokens
- `grid` responsive layout (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`)
- Horizontal scroll carousel with `overflow-x-auto no-scrollbar`

## Code

```tsx
import { useState } from "react";
import {
  Text, TruncatedText, Badge, Button, Card, CardImage, CardContent,
  Input, InteractiveBadge, Separator,
} from "@adaptionlabs/ui-kit";
import {
  Search, User, Heart, ShoppingBag, SlidersHorizontal, Star,
  ChevronRight, ArrowRight,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  colors: string[];
  rating: number;
  reviews: number;
  badge?: string;
}

const products: Product[] = [
  { id: 1, name: "Ultra Light Down Jacket", price: 79.90, originalPrice: 99.90,
    image: "https://picsum.photos/seed/jacket/400/534",
    colors: ["bg-gray-5", "bg-blue-5", "bg-red-5"],
    rating: 4.5, reviews: 234, badge: "Sale" },
  { id: 2, name: "Merino Wool Crew Neck Sweater", price: 49.90,
    image: "https://picsum.photos/seed/sweater/400/534",
    colors: ["bg-gray-4", "bg-mint-3"],
    rating: 4.8, reviews: 189 },
  { id: 3, name: "AIRism Cotton Oversized T-Shirt", price: 19.90,
    image: "https://picsum.photos/seed/tshirt/400/534",
    colors: ["bg-gray-0", "bg-gray-5", "bg-blue-4"],
    rating: 4.6, reviews: 412, badge: "New" },
  // ... more products
];

const categories = ["All", "Outerwear", "Tops", "Bottoms", "Accessories"];

// Star rating helper
const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star key={i}
        className={`size-3.5 ${i < Math.floor(rating) ? "fill-yellow-5 text-yellow-5" : "text-gray-2"}`} />
    ))}
  </div>
);

// Product card — Card variant="ghost" with CardImage ratio="portrait"
const ProductCard = ({ product }: { product: Product }) => (
  <Card variant="ghost" spacing="none" className="group cursor-pointer">
    <div className="relative overflow-hidden rounded-[4px]">
      <CardImage src={product.image} alt={product.name} ratio="portrait"
        className="transition-transform duration-300 group-hover:scale-105" />
      {product.badge && (
        <div className="absolute top-2 left-2">
          <Badge size="sm" color="default"
            className={product.badge === "Sale"
              ? "bg-red-1 text-red-5 [--hairline-color:var(--color-red-5)]"
              : "bg-blue-1 text-blue-5 [--hairline-color:var(--color-blue-5)]"}>
            {product.badge}
          </Badge>
        </div>
      )}
      <Button variant="ghost" size="icon-sm" aria-label="Add to wishlist"
        className="absolute top-2 right-2 bg-gray-0/80">
        <Heart className="size-4" />
      </Button>
    </div>
    <CardContent className="flex flex-col gap-1.5 pt-3">
      <TruncatedText variant="body" weight="regular">{product.name}</TruncatedText>
      <div className="flex items-center gap-2">
        <Text variant="body" weight="bold" as="span">${product.price.toFixed(2)}</Text>
        {product.originalPrice && (
          <Text variant="label" color="secondary" as="span" className="line-through">
            ${product.originalPrice.toFixed(2)}
          </Text>
        )}
      </div>
      <div className="flex items-center gap-2">
        <RatingStars rating={product.rating} />
        <Text variant="label" color="secondary" as="span">({product.reviews})</Text>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        {product.colors.map((color, i) => (
          <div key={i} className={`size-4 rounded-full border border-stroke-secondary ${color}`} />
        ))}
      </div>
    </CardContent>
  </Card>
);

// Featured promo — Card outlined + rounded + horizontal
const FeaturedProductCard = () => (
  <Card variant="outlined" shape="rounded" orientation="horizontal"
    spacing="none" className="col-span-2 self-start">
    <CardImage src="https://picsum.photos/seed/featured-promo/400/534" alt="Featured"
      shape="rounded" className="w-[250px] aspect-400/534 shrink-0 object-cover" />
    <CardContent className="flex flex-col gap-3 p-4 min-w-0">
      <Badge size="md" color="accent" className="self-start">Featured</Badge>
      <Text variant="h3" weight="bold">Spring Collection 2026</Text>
      <Text variant="body" color="secondary">
        Discover our latest arrivals — light fabrics and fresh colors.
      </Text>
      <div className="flex items-center gap-2 mt-auto">
        <Button variant="black" size="48">
          Shop Now<ArrowRight className="size-4" />
        </Button>
        <Button variant="tertiary" size="48">Learn More</Button>
      </div>
    </CardContent>
  </Card>
);

// --- Main ---
const ShoppingUI = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="flex flex-col gap-6 bg-background-primary min-h-screen">
      {/* Header with ghost icon buttons */}
      <header className="flex flex-col gap-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="bold">STORE</Text>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Search">
              <Search className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Wishlist">
              <Heart className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Cart">
              <ShoppingBag className="size-5" />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Account">
              <User className="size-5" />
            </Button>
          </div>
        </div>

        {/* Input — labeled + outlined */}
        <Input variant="labeled" fill="outlined" label="Search"
          placeholder="Search for products..."
          leftElement={<Search className="size-5 text-icon-secondary" />} />

        {/* Category filter chips — InteractiveBadge neutral + accent */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <InteractiveBadge key={cat} size="md" color="neutral"
              isSelected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}>
              {cat}
            </InteractiveBadge>
          ))}
          <InteractiveBadge size="md" color="accent">
            <SlidersHorizontal className="size-4" />
            Filters
          </InteractiveBadge>
        </div>
      </header>

      <Separator color="secondary" />

      {/* Product grid with featured card */}
      <div className="px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <FeaturedProductCard />
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      <Separator color="secondary" />

      {/* Carousel — Card variant="filled" shape="rounded" */}
      <section className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Text variant="title" weight="bold">You Might Also Like</Text>
          <Button variant="link" size="40">
            View all<ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {products.slice(0, 4).map((product) => (
            <Card key={product.id} variant="filled" spacing="none"
              shape="rounded" className="w-44 shrink-0">
              <CardImage src={product.image} alt={product.name}
                ratio="square" shape="rounded" />
              <CardContent className="flex flex-col gap-1 p-3 min-w-0">
                <TruncatedText variant="label" weight="regular">{product.name}</TruncatedText>
                <Text variant="label" weight="bold" as="span">
                  ${product.price.toFixed(2)}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Load more — Button secondary + rounded */}
      <div className="flex justify-center py-6">
        <Button variant="secondary" size="40" radius="rounded">
          Load More Products
        </Button>
      </div>
    </div>
  );
};
```
