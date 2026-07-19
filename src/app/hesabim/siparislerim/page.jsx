import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SiparislerimClient from "./SiparislerimClient";

export const dynamic = "force-dynamic";

export default async function SiparislerimPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/hesabim");
  }

  // Find orders by user email (since older orders might not have userId)
  const orders = await prisma.order.findMany({
    where: { customer: session.user.email },
    orderBy: { createdAt: "desc" },
  });

  // Serialize orders to pass safely to Client Component (Prisma dates & decimals)
  const serializedOrders = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    total: Number(order.total),
    status: order.status,
  }));

  return (
    <div className="min-h-screen pt-32 pb-24 bg-background relative overflow-hidden">
      <SiparislerimClient orders={serializedOrders} />
    </div>
  );
}
