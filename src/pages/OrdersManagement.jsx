
import { useEffect, useState } from "react";
import { db } from "../firebase";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

function OrdersManagement({ setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  useEffect(() => {
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orderList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data()
        }));

        setOrders(orderList);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Orders loading error:", err);
        setError("Unable to load orders. Please check permissions.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update order status.");
    } finally {
      setUpdating("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#2563eb";
      case "delivered":
        return "#059669";
      case "cancelled":
        return "#dc2626";
      default:
        return "#d97706";
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      <button
        onClick={() => setPage("admin-dashboard")}
        style={backButtonStyle}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ color: "#1e293b", marginBottom: "5px" }}>
        Orders Management
      </h1>

      <p style={{ color: "#64748b" }}>
        View and manage all customer orders.
      </p>

      <h3 style={{ color: "#334155", marginTop: "25px" }}>
        Total Orders: {orders.length}
      </h3>

      {error && (
        <p style={{ color: "#dc2626" }}>{error}</p>
      )}

      {orders.length === 0 && !error ? (
        <div style={emptyStyle}>
          <h2>No Orders Found</h2>
          <p>Customer orders will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>

          {orders.map((order) => (
            <div key={order.id} style={cardStyle}>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div>
                  <h3>Order #{order.id.slice(0, 8)}</h3>

                  <p style={infoStyle}>
                    Date: {order.createdAt?.toDate
                      ? order.createdAt.toDate().toLocaleString()
                      : "Processing..."}
                  </p>
                </div>

                <span style={{
                  background: getStatusColor(order.status),
                  color: "white",
                  padding: "7px 14px",
                  borderRadius: "20px",
                  textTransform: "capitalize"
                }}>
                  {order.status || "pending"}
                </span>
              </div>

              <hr style={lineStyle} />

              <h3>Buyer Information</h3>

              <p style={infoStyle}>
                <strong>Name:</strong> {order.buyerName}
              </p>

              <p style={infoStyle}>
                <strong>Phone:</strong> {order.buyerPhone}
              </p>

              <p style={infoStyle}>
                <strong>Delivery Address:</strong> {order.deliveryAddress}
              </p>

              <hr style={lineStyle} />

              <h3>Ordered Products</h3>

              {(order.items || []).map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    padding: "12px 0",
                    borderBottom: "1px solid #e2e8f0",
                    flexWrap: "wrap"
                  }}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      style={{
                        width: "65px",
                        height: "65px",
                        objectFit: "cover",
                        borderRadius: "8px"
                      }}
                    />
                  )}

                  <div>
                    <strong>{item.productName}</strong>

                    <p style={infoStyle}>
                      Quantity: {item.quantity}
                    </p>

                    <p style={infoStyle}>
                      Price: ৳{item.price}
                    </p>

                    <p style={infoStyle}>
                      Seller: {item.sellerName || "N/A"}
                    </p>
                  </div>
                </div>
              ))}

              <h2 style={{
                color: "#059669",
                marginTop: "18px"
              }}>
                Total: ৳{order.totalAmount}
              </h2>

              <p style={infoStyle}>
                Payment: {order.paymentMethod}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "20px"
              }}>
                <strong>Update Status:</strong>

                <select
                  value={order.status || "pending"}
                  disabled={updating === order.id}
                  onChange={(e) =>
                    updateOrderStatus(order.id, e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {updating === order.id && (
                  <span>Updating...</span>
                )}
              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f6fb",
  padding: "30px"
};

const backButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
  fontSize: "14px"
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  color: "#1e293b"
};

const emptyStyle = {
  background: "white",
  padding: "40px",
  marginTop: "20px",
  borderRadius: "12px",
  textAlign: "center",
  color: "#64748b"
};

const infoStyle = {
  color: "#64748b",
  margin: "7px 0"
};

const lineStyle = {
  border: "none",
  borderTop: "1px solid #e2e8f0",
  margin: "18px 0"
};

const selectStyle = {
  padding: "10px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  cursor: "pointer"
};

export default OrdersManagement;
