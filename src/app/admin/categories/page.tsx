import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await getRequestSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
          CATALOG // STRUCTURE
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
          Categories
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Organize streetwear drops, apparel classifications and sub-genres.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
