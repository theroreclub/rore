import DropRoom from "@/components/DropRoom";
import { conceptCatalog } from "@/lib/catalog";

export default function Home() {
  return <DropRoom products={conceptCatalog} />;
}
