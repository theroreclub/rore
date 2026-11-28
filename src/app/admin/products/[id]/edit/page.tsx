import { AdminProductRowActions } from "@/components/admin/AdminProductRowActions";
import { getRequestSession } from "@/lib/auth-checks";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Edit product · Admin | RORE CLUB",
  description: "Update your product details, prices, images, and available variants.",
  robots: { index: false },
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getRequestSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        regularPrice: true,
        stock: true,
        categoryId: true,
        isActive: true,
        images: true,
        qikinkVariants: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
          Edit Product: {product.name}
        </h1>
      </div>

      <AdminProductRowActions productId={product.id} productName={product.name} isActive={product.isActive} editor />
      <ProductForm categories={categories} initialData={product} />
    </div>
  );
}
