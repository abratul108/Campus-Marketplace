
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
  getDoc,
} from "firebase/firestore";

function Cart({ setPage }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const cartRef = collection(db, "users", user.uid, "cart");

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const items = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setCartItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Cart loading error:", error);
        alert("Could not load cart: " + error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      const user = auth.currentUser;

      if (!user) return;

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setBuyerName(data.name || user.displayName || "");
          setBuyerPhone(data.phone || "");
        }
      } catch (error) {
        console.error("User information error:", error);
      }
    };

    loadUserInfo();
  }, []);

  const updateQuantity = async (item, change) => {
    const user = auth.currentUser;

    if (!user) return;

    const newQuantity = Number(item.quantity || 1) + change;

    if (newQuantity < 1 || newQuantity > 99) return;

    try {
      const itemRef = doc(db, "users", user.uid, "cart", item.id);

      await updateDoc(itemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Quantity update error:", error);
      alert("Could not update quantity: " + error.message);
    }
  };

  const removeItem = async (itemId) => {
    const user = auth.currentUser;

    if (!user) return;

    const confirmRemove = window.confirm(
      "Are you sure you want to remove this product?"
    );

    if (!confirmRemove) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "cart", itemId));
    } catch (error) {
      console.error("Remove item error:", error);
      alert("Could not remove product: " + error.message);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const placeOrder = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!buyerName.trim() || !buyerPhone.trim() || !deliveryAddress.trim()) {
      alert("Please fill in all checkout information.");
      return;
    }

    if (!/^[0-9+\-\s]{7,20}$/.test(buyerPhone.trim())) {
      alert("Please enter a valid phone number.");
      return;
    }

    setPlacingOrder(true);

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        productName: item.productName || "Product",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        sellerId: item.sellerId || "",
        sellerName: item.sellerName || "",
        category: item.category || "",
        image: item.image || "",
      }));

      const orderData = {
        buyerId: user.uid,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),

        items: orderItems,

        totalAmount: totalPrice,

        status: "pending",
        paymentMethod: "Cash on Delivery",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(
        collection(db, "orders"),
        orderData
      );

      try {
        await Promise.all(
          cartItems.map((item) =>
            deleteDoc(
              doc(db, "users", user.uid, "cart", item.id)
            )
          )
        );
      } catch (cleanupError) {
        console.error("Cart cleanup error:", cleanupError);
      }

      alert(
        "Order placed successfully!\nOrder ID: " + orderRef.id
      );

      setCheckoutOpen(false);
      setDeliveryAddress("");

      setPage("my-orders");
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Could not place order: " + error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#1e293b" }}>
            🛒 My Shopping Cart
          </h1>

          <p style={{ color: "#64748b" }}>
            Review your selected products
          </p>
        </div>

        <button
          onClick={() => setPage("home")}
          style={continueButton}
        >
          ← Continue Shopping
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: "55px" }}>🛒</div>

          <h2>Your Cart is Empty</h2>

          <p>
            You have not added any products to your cart yet.
          </p>

          <button
            onClick={() => setPage("home")}
            style={shopButton}
          >
            Explore Products
          </button>
        </div>
      ) : (
        <div style={contentStyle}>
          <div style={itemsStyle}>
            {cartItems.map((item) => (
              <div key={item.id} style={itemStyle}>
                <div style={imageStyle}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "9px",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: "35px" }}>📦</span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 7px", color: "#1e293b" }}>
                    {item.productName}
                  </h3>

                  <p style={{ color: "#64748b", margin: "4px 0" }}>
                    {item.category}
                  </p>

                  <p style={{ color: "#64748b", margin: "4px 0" }}>
                    Seller: {item.sellerName}
                  </p>

                  <strong style={{ color: "#059669" }}>
                    ৳{item.price}
                  </strong>

                  <div style={quantityStyle}>
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      style={quantityButton}
                    >
                      −
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      onClick={() => updateQuantity(item, 1)}
                      style={quantityButton}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong style={{ color: "#1e293b" }}>
                    ৳{(
                      Number(item.price || 0) *
                      Number(item.quantity || 1)
                    ).toLocaleString("en-BD")}
                  </strong>

                  <br />

                  <button
                    onClick={() => removeItem(item.id)}
                    style={removeButton}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={summaryStyle}>
              <h2>Order Summary</h2>

              <div style={summaryRow}>
                <span>Total Products</span>
                <strong>{totalQuantity}</strong>
              </div>

              <div style={summaryRow}>
                <span>Subtotal</span>
                <strong>
                  ৳{totalPrice.toLocaleString("en-BD")}
                </strong>
              </div>

              <div style={summaryRow}>
                <span>Delivery Charge</span>
                <strong>৳0</strong>
              </div>

              <hr />

              <div style={summaryRow}>
                <strong>Total</strong>

                <strong style={{ color: "#059669", fontSize: "22px" }}>
                  ৳{totalPrice.toLocaleString("en-BD")}
                </strong>
              </div>

              <button
                onClick={() => setCheckoutOpen(!checkoutOpen)}
                style={checkoutButton}
              >
                {checkoutOpen ? "Close Checkout" : "Proceed to Checkout"}
              </button>
            </div>

            {checkoutOpen && (
              <form onSubmit={placeOrder} style={checkoutStyle}>
                <h2>Checkout Information</h2>

                <label style={labelStyle}>Full Name</label>

                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  style={inputStyle}
                />

                <label style={labelStyle}>Phone Number</label>

                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  style={inputStyle}
                />

                <label style={labelStyle}>
                  Delivery Address / Campus Location
                </label>

                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your campus, department or delivery location"
                  required
                  rows="3"
                  style={inputStyle}
                />

                <div style={paymentStyle}>
                  <strong>Payment Method</strong>
                  <p style={{ margin: "7px 0 0" }}>
                    Cash on Delivery
                  </p>
                </div>

                <div style={summaryRow}>
                  <strong>Total Payable</strong>
                  <strong style={{ color: "#059669" }}>
                    ৳{totalPrice.toLocaleString("en-BD")}
                  </strong>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  style={{
                    ...checkoutButton,
                    opacity: placingOrder ? 0.6 : 1,
                  }}
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f6fb",
  padding: "30px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "25px",
};

const contentStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
  gap: "22px",
  alignItems: "start",
};

const itemsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const itemStyle = {
  background: "white",
  padding: "18px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "18px",
  flexWrap: "wrap",
  boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
};

const imageStyle = {
  width: "105px",
  height: "105px",
  background: "#e2e8f0",
  borderRadius: "9px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const quantityStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  marginTop: "12px",
};

const quantityButton = {
  width: "30px",
  height: "30px",
  border: "none",
  borderRadius: "6px",
  background: "#e2e8f0",
  cursor: "pointer",
  fontSize: "18px",
};

const removeButton = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  cursor: "pointer",
  marginTop: "12px",
};

const summaryStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "12px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  margin: "17px 0",
  color: "#334155",
};

const emptyStyle = {
  background: "white",
  padding: "60px 20px",
  borderRadius: "12px",
  textAlign: "center",
  color: "#64748b",
};

const shopButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "15px",
};

const continueButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer",
};

const checkoutButton = {
  width: "100%",
  background: "#059669",
  color: "white",
  border: "none",
  padding: "13px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "12px",
};

const checkoutStyle = {
  background: "white",
  padding: "22px",
  borderRadius: "12px",
  marginTop: "18px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
};

const labelStyle = {
  display: "block",
  marginTop: "15px",
  marginBottom: "7px",
  color: "#334155",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  outline: "none",
  fontSize: "14px",
};

const paymentStyle = {
  background: "#ecfdf5",
  padding: "13px",
  borderRadius: "8px",
  marginTop: "18px",
  color: "#065f46",
};

export default Cart;
