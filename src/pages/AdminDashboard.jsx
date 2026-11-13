
import { useEffect, useState } from "react";
import { seedProducts } from "../seedProducts";
import { db } from "../firebase";
import {
  collection,
  onSnapshot
} from "firebase/firestore";

function AdminDashboard({ handleLogout, setPage }) {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setStats((prev) => ({
          ...prev,
          users: snapshot.size
        }));
      },
      (error) => console.error("Users stats error:", error)
    );

    const unsubProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        setStats((prev) => ({
          ...prev,
          products: snapshot.size
        }));
      },
      (error) => console.error("Products stats error:", error)
    );

    const unsubOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const pending = snapshot.docs.filter(
          (item) => item.data().status === "pending"
        ).length;

        setStats((prev) => ({
          ...prev,
          orders: snapshot.size,
          pendingOrders: pending
        }));
      },
      (error) => console.error("Orders stats error:", error)
    );

    return () => {
      unsubUsers();
      unsubProducts();
      unsubOrders();
    };
  }, []);

  return (
    <div style={pageStyle}>

      <div style={headerStyle}>
        <div>
          <h1 style={{ marginBottom: "5px" }}>
            Admin Dashboard
          </h1>

          <p style={{ color: "#64748b" }}>
            Welcome to Campus Marketplace Admin Panel
          </p>
        </div>

        <button onClick={handleLogout} style={logoutStyle}>
          Logout
        </button>
      </div>

      <h2 style={{ marginTop: "30px" }}>
        Dashboard Overview
      </h2>

      <div style={statsGridStyle}>
        <StatCard
          title="Total Users"
          value={stats.users}
          icon="👥"
          color="#2563eb"
        />

        <StatCard
          title="Total Products"
          value={stats.products}
          icon="📦"
          color="#059669"
        />

        <StatCard
          title="Total Orders"
          value={stats.orders}
          icon="📋"
          color="#7c3aed"
        />

        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon="⏳"
          color="#d97706"
        />
      </div>

      <h2 style={{ marginTop: "35px" }}>
        Management Center
      </h2>

      <div style={cardsGridStyle}>

        <div style={cardStyle}>
          <h2>👥 Users Management</h2>
          <p>Manage registered buyers and sellers.</p>

          <button
            onClick={() => setPage("users-management")}
            style={buttonStyle}
          >
            View Users
          </button>
        </div>

        <div style={cardStyle}>
          <h2>📦 Products Management</h2>
          <p>Monitor and manage marketplace products.</p>

          <button
            onClick={() => setPage("products-management")}
            style={buttonStyle}
          >
            View Products
          </button>

          <button
            onClick={seedProducts}
            style={datasetButtonStyle}
          >
            Load Demo Dataset
          </button>
        </div>

        <div style={cardStyle}>
          <h2>📋 Orders Management</h2>
          <p>View customer orders and manage order status.</p>

          <button
            onClick={() => setPage("orders-management")}
            style={buttonStyle}
          >
            View Orders
          </button>
        </div>

        <div style={cardStyle}>
          <h2>❤️ Marketplace</h2>
          <p>Visit and explore the Campus Marketplace.</p>

          <button
            onClick={() => setPage("home")}
            style={buttonStyle}
          >
            Visit Marketplace
          </button>
        </div>

      </div>

      <div style={controlStyle}>
        <h2>Admin Control Center</h2>

        <p style={{ color: "#64748b" }}>
          You are logged in as an administrator.
          Monitor users, products and orders from this dashboard.
        </p>

        <p style={{ color: "#64748b", marginTop: "12px" }}>
          All statistics are connected to your Firebase Firestore database
          and update automatically when data changes.
        </p>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div style={statCardStyle}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <p style={{ color: "#64748b", margin: 0 }}>
            {title}
          </p>

          <h1 style={{
            fontSize: "32px",
            margin: "12px 0 0",
            color
          }}>
            {value}
          </h1>
        </div>

        <span style={{ fontSize: "35px" }}>
          {icon}
        </span>
      </div>
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
  gap: "15px"
};

const logoutStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "8px",
  cursor: "pointer"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginTop: "20px"
};

const statCardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.06)"
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px"
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
  color: "#1e293b"
};

const buttonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px",
  marginRight: "8px"
};

const datasetButtonStyle = {
  background: "#059669",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "10px"
};

const controlStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  marginTop: "30px"
};

export default AdminDashboard;
