import Link from "next/link";
import { CATEGORIES, SAMPLE_INTERNSHIPS } from "@/data/internships";

export default function CategoriesPage() {
  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    name: cat,
    count: SAMPLE_INTERNSHIPS.filter((i) => i.category === cat).length,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground text-bangla mb-8">Categories</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((cat) => (
            <Link
              key={cat.name}
              href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="block"
            >
              <div className="bg-card border border-input rounded-xl p-6 hover:bg-secondary hover:border-primary transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">{cat.name}</span>
                  <span className="text-xs font-medium bg-primary/10 text-primary">
                    {cat.count}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Internship opportunities in {cat.name.toLowerCase()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
