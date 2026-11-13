
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebase";

function ProductsManagement({ setPage }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, "products"));

      const productList = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      setProducts(productList);
    } catch (error) {
      console.error("Products loading error:", error);
      alert("Products load করা যায়নি। Firestore Rules পরীক্ষা করো।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "তুমি কি নিশ্চিত এই Product Delete করতে চাও?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", productId));

      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );

      alert("Product successfully deleted!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Product Delete করা যায়নি। Firestore Rules পরীক্ষা করো।");
    }
  };

  const filteredProducts = products.filter((product) =>
    (product.productName || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f6fb",
      padding: "30px"
    }}>

      <button
        onClick={() => setPage("admin-dashboard")}
        style={backButton}
      >
        ← Back to Dashboard
      </button>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        marginTop: "20px"
      }}>
        <div>
          <h1 style={{ color: "#1e293b" }}>
            Products Management
          </h1>
          <p style={{ color: "#64748b" }}>
            Manage all marketplace products
          </p>
        </div>

        <div style={countStyle}>
          Total Products: {products.length}
        </div>
      </div>

      <input
        type="text"
        placeholder="Search product by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={searchStyle}
      />

      <button onClick={fetchProducts} style={refreshButton}>
        Refresh Products
      </button>

      {loading ? (
        <p>Loading products...</p>
      ) : filteredProducts.length === 0 ? (
        <p style={{ marginTop: "25px", color: "#64748b" }}>
          No products found.
        </p>
      ) : (
        <div style={{
          background: "white",
          borderRadius: "12px",
          overflowX: "auto",
          marginTop: "20px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.06)"
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "750px"
          }}>
            <thead>
              <tr style={{ background: "#e2e8f0" }}>
                <th style={cellStyle}>Product Name</th>
                <th style={cellStyle}>Price</th>
                <th style={cellStyle}>Category</th>
                <th style={cellStyle}>Seller</th>
                <th style={cellStyle}>Location</th>
                <th style={cellStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td style={cellStyle}>
                    {product.productName || "N/A"}
                  </td>

                  <td style={cellStyle}>
                    ৳{product.price ?? "N/A"}
                  </td>

                  <td style={cellStyle}>
                    {product.category || "N/A"}
                  </td>

                  <td style={cellStyle}>
                    {product.sellerName || "N/A"}
                  </td>

                  <td style={cellStyle}>
                    {product.location || "N/A"}
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={deleteButton}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

const cellStyle = {
  padding: "14px",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155"
};

const backButton = {
  background: "#475569",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer"
};

const countStyle = {
  background: "white",
  padding: "15px 20px",
  borderRadius: "8px",
  color: "#2563eb",
  fontWeight: "bold"
};

const searchStyle = {
  padding: "12px",
  width: "100%",
  maxWidth: "400px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  marginTop: "20px",
  marginRight: "10px",
  boxSizing: "border-box"
};

const refreshButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "20px"
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 14px",
  borderRadius: "6px",
  cursor: "pointer"
};

export default ProductsManagement;
