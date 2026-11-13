import Papa from "papaparse";
import { collection, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";

export const importProducts = async () => {
  const response = await fetch("/campus_marketplace_1000_dataset.csv");

  if (!response.ok) {
    throw new Error("CSV file পাওয়া যায়নি");
  }

  const csvText = await response.text();

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const products = results.data;

  console.log("Total products:", products.length);

  for (let i = 0; i < products.length; i += 500) {
    const batch = writeBatch(db);
    const chunk = products.slice(i, i + 500);

    chunk.forEach((product) => {
      const productRef = doc(
        collection(db, "products"),
        product.productId
      );

      batch.set(productRef, {
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        price: Number(product.price),
        description: product.description,
        sellerName: product.sellerName,
        phone: product.phone,
        condition: product.condition,
        image: product.image,
        createdAt: product.createdAt,
      });
    });

    await batch.commit();

    console.log(
      `Uploaded ${Math.min(i + 500, products.length)} / ${products.length}`
    );
  }

  console.log("✅ All products uploaded successfully!");
  alert("✅ 1000 products successfully uploaded!");
};