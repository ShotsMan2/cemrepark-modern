import { getProducts } from "../data/products";
import HomeClient from "./HomeClient";

export const dynamic = 'force-dynamic';

export default function Home() {
  const products = getProducts();
  const bestSellers = products.slice(0, 4);
  const discounted = products.slice(4, 8);

  return (
    <HomeClient bestSellers={bestSellers} discounted={discounted} />
  );
}
