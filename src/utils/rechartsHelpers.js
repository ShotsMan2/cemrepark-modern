export const transformSalesTrends = (orders) => {
  if (!orders || !Array.isArray(orders)) return [];
  const trends = {};

  orders.forEach((order) => {
    // Assuming order.tarih or order.createdAt is a date string
    const date = new Date(order.createdAt || order.tarih);
    const day = date.toLocaleDateString("tr-TR", { weekday: "short" });

    if (!trends[day]) {
      trends[day] = { name: day, total: 0 };
    }
    trends[day].total += order.total || order.toplamTutar || 0;
  });

  const daysOrder = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  return Object.values(trends).sort(
    (a, b) => daysOrder.indexOf(a.name) - daysOrder.indexOf(b.name)
  );
};

export const transformCategoryPopularity = (products) => {
  if (!products || !Array.isArray(products)) return [];
  const categories = {};

  products.forEach((product) => {
    const cat = product.kategori || "Diğer";
    if (!categories[cat]) {
      categories[cat] = { name: cat, value: 0 };
    }
    categories[cat].value += 1;
  });

  return Object.values(categories).sort((a, b) => b.value - a.value);
};

export const transformOrderStatuses = (orders) => {
  if (!orders || !Array.isArray(orders)) return [];
  const statuses = {};

  orders.forEach((order) => {
    const status = order.durum || "Beklemede";
    if (!statuses[status]) {
      statuses[status] = { name: status, value: 0 };
    }
    statuses[status].value += 1;
  });

  return Object.values(statuses);
};
