
import { useEffect, useState } from "react";
import {
  collection,
  getDocs
} from "firebase/firestore";

import { db } from "../firebase";

function UsersManagement({ setPage }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const snapshot = await getDocs(
        collection(db, "users")
      );

      const userList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      setUsers(userList);

    } catch (err) {
      console.error("Users fetch error:", err);
      setError("Unable to load users. Please check Firestore Rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      (user.name || "").toLowerCase().includes(value) ||
      (user.email || "").toLowerCase().includes(value) ||
      (user.role || "").toLowerCase().includes(value)
    );
  });

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Users Management</h1>
          <p style={styles.subtitle}>
            Manage Campus Marketplace users
          </p>
        </div>

        <button
          style={styles.backButton}
          onClick={() => setPage("admin-dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.stats}>
        <div style={styles.statCard}>
          <h2>{users.length}</h2>
          <p>Total Users</p>
        </div>

        <div style={styles.statCard}>
          <h2>
            {users.filter((u) => u.role === "buyer").length}
          </h2>
          <p>Buyers</p>
        </div>

        <div style={styles.statCard}>
          <h2>
            {users.filter((u) => u.role === "seller").length}
          </h2>
          <p>Sellers</p>
        </div>

        <div style={styles.statCard}>
          <h2>
            {users.filter((u) => u.role === "admin").length}
          </h2>
          <p>Admins</p>
        </div>
      </div>

      <div style={styles.tableCard}>

        <div style={styles.tableHeader}>
          <h2>All Registered Users</h2>

          <input
            style={styles.search}
            type="text"
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p style={styles.message}>Loading users...</p>
        ) : error ? (
          <p style={{ ...styles.message, color: "red" }}>
            {error}
          </p>
        ) : filteredUsers.length === 0 ? (
          <p style={styles.message}>No users found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Verification</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td style={styles.td}>
                      {user.name || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {user.email || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {user.phone || "N/A"}
                    </td>

                    <td style={styles.td}>
                      <span style={{
                        ...styles.role,
                        background:
                          user.role === "admin"
                            ? "#ede9fe"
                            : user.role === "seller"
                            ? "#dbeafe"
                            : "#dcfce7",
                        color:
                          user.role === "admin"
                            ? "#6d28d9"
                            : user.role === "seller"
                            ? "#1d4ed8"
                            : "#15803d"
                      }}>
                        {user.role || "buyer"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <span style={{
                        color: user.emailVerified
                          ? "#15803d"
                          : "#dc2626",
                        fontWeight: "600"
                      }}>
                        {user.emailVerified
                          ? "Verified"
                          : "Not Verified"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={fetchUsers}
          style={styles.refreshButton}
        >
          ↻ Refresh Users
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    padding: "30px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "30px"
  },
  heading: {
    color: "#1e293b",
    margin: 0,
    fontSize: "28px"
  },
  subtitle: {
    color: "#64748b"
  },
  backButton: {
    padding: "11px 18px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
    marginBottom: "25px"
  },
  statCard: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
  },
  tableCard: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    boxShadow: "0 3px 12px rgba(0,0,0,0.05)"
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px"
  },
  search: {
    padding: "11px",
    width: "280px",
    maxWidth: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },
  th: {
    padding: "14px",
    background: "#f1f5f9",
    color: "#334155",
    whiteSpace: "nowrap"
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569"
  },
  role: {
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600"
  },
  message: {
    padding: "25px",
    textAlign: "center",
    color: "#64748b"
  },
  refreshButton: {
    marginTop: "20px",
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }
};

export default UsersManagement;
