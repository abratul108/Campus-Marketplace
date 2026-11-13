
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db, auth } from "../firebase";
import "./Wishlist.css";

function Wishlist({ setPage, setSelectedProduct }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      const user = auth.currentUser;

      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      try {
        const wishlistRef = collection(
          db,
          "users",
          user.uid,
          "wishlist"
        );

        const wishlistSnap = await getDocs(wishlistRef);

        const wishlistData = wishlistSnap.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setWishlist(wishlistData);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        alert("Could not load wishlist: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please login first!");
      return;
    }

    try {
      await deleteDoc(
        doc(db, "users", user.uid, "wishlist", productId)
      );

      setWishlist((prev) =>
        prev.filter((item) => item.id !== productId)
      );
    } catch (error) {
      console.error("Error removing wishlist:", error);
      alert("Failed to remove from wishlist: " + error.message);
    }
  };

  const handleProductClick = (productId) => {
    if (setSelectedProduct) {
      setSelectedProduct(productId);
    }

    if (setPage) {
      setPage("product-details");
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-message">
          <h2>Loading Wishlist...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">

      <button
        className="wishlist-back-button"
        onClick={() => setPage("home")}
      >
        ← Back to Marketplace
      </button>

      <div className="wishlist-header">
        <h1>❤️ My Wishlist</h1>
        <p>
          {wishlist.length} saved{" "}
          {wishlist.length === 1 ? "product" : "products"}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <div className="empty-icon">♡</div>

          <h2>Your Wishlist is Empty</h2>

          <p>You haven't saved any products yet.</p>

          <button
            className="browse-products-button"
            onClick={() => setPage("home")}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">

          {wishlist.map((item) => (
            <div className="wishlist-card" key={item.id}>

              <div
                className="wishlist-image"
                onClick={() => handleProductClick(item.productId)}
              >
                <img
                  src={item.image || ""}
                  alt={item.productName || "Product"}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>

              <div className="wishlist-info">

                <span className="wishlist-category">
                  {item.category}
                </span>

                <h2
                  onClick={() =>
                    handleProductClick(item.productId)
                  }
                >
                  {item.productName}
                </h2>

                <div className="wishlist-price">
                  ৳{item.price}
                </div>

                <p>
                  Seller: <strong>{item.sellerName}</strong>
                </p>

                <div className="wishlist-actions">

                  <button
                    className="view-product-button"
                    onClick={() =>
                      handleProductClick(item.productId)
                    }
                  >
                    View Product
                  </button>

                  <button
                    className="remove-wishlist-button"
                    onClick={() => handleRemove(item.id)}
                  >
                    🗑 Remove
                  </button>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
