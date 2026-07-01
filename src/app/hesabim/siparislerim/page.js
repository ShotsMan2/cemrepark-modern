import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SiparislerimPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/hesabim");
  }

  // Find orders by user email (since older orders might not have userId)
  const orders = await prisma.order.findMany({
    where: { customer: session.user.email },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        
        <div className="mb-8">
          <Link href="/hesabim" className="text-gray-400 hover:text-neon-pink transition-colors text-sm uppercase tracking-wider flex items-center gap-2">
            <span>←</span> Hesabıma Dön
          </Link>
        </div>

        <h1 className="text-4xl font-black text-white uppercase tracking-widest mb-4 text-center">Siparişlerim</h1>
        <div className="w-24 h-1 bg-neon-pink mx-auto mb-12"></div>
        
        <div className="glass-panel p-8 clip-angled bg-black/40 border border-white/10 backdrop-blur-md">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-6">Henüz hiç siparişiniz bulunmuyor.</p>
              <Link href="/" className="inline-block bg-neon-pink text-white font-bold py-3 px-8 uppercase tracking-widest hover:bg-white hover:text-black transition-colors clip-angled">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-white/10 bg-black/50 p-6 clip-angled flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="text-white font-bold text-lg mb-1">Sipariş #{order.id}</p>
                    <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <p className="text-glow-gold font-bold text-xl mb-1">{order.total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 ${
                      order.status === 'Tamamlandı' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'İptal Edildi' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
