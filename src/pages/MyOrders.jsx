
import { useEffect, useState } from "react";

import { auth, db } from "../firebase";

import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

function MyOrders({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      setError("Please login to see your orders.");
      return;
    }

    const ordersRef = collection(db, "orders");

    const q = query(
      ordersRef,
      where("buyerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orderList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        orderList.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

        setOrders(orderList);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Orders loading error:", err);
        setError("Could not load your orders: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getStatusStyle = (status) => {
    const styles = {
      pending: {
        background: "#fef3c7",
        color: "#92400e"
      },
      confirmed: {
        background: "#dbeafe",
        color: "#1d4ed8"
      },
      delivered: {
        background: "#dcfce7",
        color: "#166534"
      },
      cancelled: {
        background: "#fee2e2",
        color: "#991b1b"
      }
    };

    return styles[status?.toLowerCase()] || {
      background: "#e2e8f0",
      color: "#334155"
    };
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) {
      return "Date not available";
    }

    return timestamp.toDate().toLocaleString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, color: "#1e293b" }}>
            📦 My Orders
          </h1>

          <p style={{ color: "#64748b" }}>
            Track and manage your purchases
          </p>
        </div>

        <button
          onClick={() => setPage("home")}
          style={shopButton}
        >
          ← Continue Shopping
        </button>
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div style={emptyStyle}>
          <div style={{ fontSize: "55px" }}>📦</div>

          <h2>No Orders Yet</h2>

          <p>
            You have not placed any orders yet.
          </p>

          <button
            onClick={() => setPage("home")}
            style={shopButton}
          >
            Explore Products
          </button>
        </div>
      )}

      {orders.length > 0 && (
        <>
          <div style={countStyle}>
            Total Orders: <strong>{orders.length}</strong>
          </div>

          <div style={ordersContainer}>
            {orders.map((order) => (
              <div key={order.id} style={orderCard}>

                <div style={orderHeader}>
                  <div>
                    <h3 style={{ margin: "0 0 7px", color: "#1e293b" }}>
                      Order #{order.id.slice(0, 10)}
                    </h3>

                    <p style={dateStyle}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    style={{
                      ...statusStyle,
                      ...getStatusStyle(order.status)
                    }}
                  >
                    {(order.status || "pending").toUpperCase()}
                  </span>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0" }} />

                <h4 style={{ color: "#334155" }}>
                  Ordered Products
                </h4>

                {(order.items || []).map((item, index) => (
                  <div
                    key={item.productId || index}
                    style={productStyle}
                  >
                    <div style={productImage}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.productName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px"
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "27px" }}>📦</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "#1e293b" }}>
                        {item.productName}
                      </strong>

                      <p style={smallText}>
                        Quantity: {item.quantity}
                      </p>

                      <p style={smallText}>
                        Price: ৳{Number(item.price || 0).toLocaleString("en-BD")}
                      </p>

                      {item.sellerName && (
                        <p style={smallText}>
                          Seller: {item.sellerName}
                        </p>
                      )}
                    </div>

                    <strong style={{ color: "#059669" }}>
                      ৳{(
                        Number(item.price || 0) *
                        Number(item.quantity || 1)
                      ).toLocaleString("en-BD")}
                    </strong>
                  </div>
                ))}

                <div style={detailsStyle}>
                  <div style={detailRow}>
                    <span>Buyer Name</span>
                    <strong>{order.buyerName}</strong>
                  </div>

                  <div style={detailRow}>
                    <span>Phone</span>
                    <strong>{order.buyerPhone}</strong>
                  </div>

                  <div style={detailRow}>
                    <span>Delivery Location</span>
                    <strong style={{ textAlign: "right", maxWidth: "60%" }}>
                      {order.deliveryAddress}
                    </strong>
                  </div>

                  <div style={detailRow}>
                    <span>Payment Method</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                </div>

                <div style={totalStyle}>
                  <span>Total Amount</span>

                  <strong>
                    ৳{Number(order.totalAmount || 0).toLocaleString("en-BD")}
                  </strong>
                </div>

              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f6fb",
  padding: "30px"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "25px"
};

const shopButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  cursor: "pointer"
};

const emptyStyle = {
  background: "white",
  padding: "60px 20px",
  borderRadius: "12px",
  textAlign: "center",
  color: "#64748b"
};

const countStyle = {
  background: "white",
  padding: "15px 20px",
  borderRadius: "10px",
  marginBottom: "18px",
  color: "#334155"
};

const ordersContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
};

const orderCard = {
  background: "white",
  padding: "22px",
  borderRadius: "13px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
};

const orderHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px"
};

const dateStyle = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0 0 10px"
};

const statusStyle = {
  padding: "7px 13px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "bold"
};

const productStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "12px 0",
  borderBottom: "1px solid #e2e8f0",
  flexWrap: "wrap"
};

const productImage = {
  width: "65px",
  height: "65px",
  background: "#e2e8f0",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0
};

const smallText = {
  color: "#64748b",
  fontSize: "13px",
  margin: "5px 0"
};

const detailsStyle = {
  background: "#f8fafc",
  padding: "15px",
  borderRadius: "9px",
  marginTop: "18px"
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "15px",
  margin: "10px 0",
  color: "#475569",
  fontSize: "14px"
};

const totalStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "18px",
  paddingTop: "15px",
  borderTop: "1px solid #e2e8f0",
  fontSize: "18px",
  color: "#059669"
};

const errorStyle = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "15px",
  borderRadius: "9px"
};

export default MyOrders;
