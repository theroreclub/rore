import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-mono font-bold tracking-widest text-rose-500 uppercase">
          CATALOG // CREATION
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
          Create New Product
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Draft a new streetwear drop, configure inventory and upload images.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
