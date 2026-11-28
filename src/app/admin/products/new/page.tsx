import { getRequestSession } from "@/lib/auth-checks";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = {
  title: "New product · Admin | RORE CLUB",
  description: "Add a product to the RORE CLUB catalog.",
  robots: { index: false },
};

export default async function NewProductPage() {
  const session = await getRequestSession();
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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
          Create New Product
        </h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
