import { auth, db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export async function addProductToCart(productId) {
  const user = auth.currentUser;

  if (!user) {
    alert("Please login first!");
    return;
  }

  try {
    // Product তথ্য Firestore থেকে নেওয়া
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      alert("Product not found!");
      return;
    }

    const product = productSnap.data();

    // নিজের Product নিজে Cart-এ যোগ করা যাবে না
    if (product.sellerId === user.uid) {
      alert("You cannot add your own product to cart!");
      return;
    }

    const cartRef = doc(
      db,
      "users",
      user.uid,
      "cart",
      productId
    );

    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      await updateDoc(cartRef, {
        quantity: increment(1),
        updatedAt: serverTimestamp(),
      });

      alert("Cart quantity updated!");
    } else {
      await setDoc(cartRef, {
        productId,
        productName: product.productName || "Product",
        price: Number(product.price || 0),
        image: product.image || "",
        category: product.category || "",
        sellerId: product.sellerId || "",
        sellerName: product.sellerName || "Seller",
        quantity: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Product added to cart successfully!");
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Could not add product to cart: " + error.message);
  }
}