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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
          Categories
        </h1>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}
