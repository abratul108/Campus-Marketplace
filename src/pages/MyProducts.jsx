
import React, { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "./MyProducts.css";

function MyProducts({ setPage, setSelectedProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    productName: "",
    price: "",
    category: "",
    description: "",
    condition: "",
    location: "",
    image: ""
  });

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setProducts([]);
          return;
        }

        const productsRef = collection(db, "products");
        const productsSnap = await getDocs(productsRef);

        const userName =
          user.displayName ||
          user.email?.split("@")[0] ||
          "";

        const productsData = productsSnap.docs
          .map((productDoc) => ({
            id: productDoc.id,
            ...productDoc.data()
          }))
          .filter((product) => {
            if (product.sellerId) {
              return product.sellerId === user.uid;
            }

            return product.sellerName === userName;
          });

        setProducts(productsData);

      } catch (error) {
        console.error("Error loading my products:", error);
        alert("Could not load your products.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  // Delete Product
  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const product = products.find(
        (item) => item.id === productId
      );

      const user = auth.currentUser;

      if (
        !user ||
        !product ||
        (
          product.sellerId
            ? product.sellerId !== user.uid
            : product.sellerName !== (
                user.displayName ||
                user.email?.split("@")[0]
              )
        )
      ) {
        alert("You are not allowed to delete this product.");
        return;
      }

      await deleteDoc(doc(db, "products", productId));

      setProducts((prev) =>
        prev.filter((product) => product.id !== productId)
      );

      alert("Product deleted successfully.");

    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete product.");
    }
  };

  // Open Edit Form
  const handleEdit = (product) => {
    setEditingProduct(product);

    setEditForm({
      productName: product.productName || "",
      price: product.price ?? "",
      category: product.category || "",
      description: product.description || "",
      condition: product.condition || "",
      location: product.location || "",
      image: product.image || ""
    });
  };

  // Form Input Change
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Update Product
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    const user = auth.currentUser;

    const isOwner =
      user &&
      (
        editingProduct.sellerId
          ? editingProduct.sellerId === user.uid
          : editingProduct.sellerName === (
              user.displayName ||
              user.email?.split("@")[0]
            )
      );

    if (!isOwner) {
      alert("You are not allowed to edit this product.");
      return;
    }

    if (
      !editForm.productName.trim() ||
      editForm.price === "" ||
      Number(editForm.price) < 0 ||
      !editForm.category
    ) {
      alert("Please enter a valid product name, price and category.");
      return;
    }

    setUpdating(true);

    try {
      const productRef = doc(
        db,
        "products",
        editingProduct.id
      );

      const updatedData = {
        productName: editForm.productName.trim(),
        price: Number(editForm.price),
        category: editForm.category,
        description: editForm.description.trim(),
        condition: editForm.condition,
        location: editForm.location.trim(),
        image: editForm.image.trim()
      };

      await updateDoc(productRef, updatedData);

      setProducts((prev) =>
        prev.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...updatedData }
            : product
        )
      );

      setEditingProduct(null);

      alert("Product updated successfully!");

    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update product. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleViewProduct = (productId) => {
    setSelectedProduct(productId);
    setPage("product-details");
  };

  if (loading) {
    return (
      <div className="my-products-page">
        <div className="my-products-message">
          <h2>Loading My Products...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-products-page">

      <button
        className="my-products-back"
        onClick={() => setPage("home")}
      >
        ← Back to Marketplace
      </button>

      <div className="my-products-header">
        <div>
          <h1>📦 My Products</h1>
          <p>Products added by you</p>
        </div>

        <div className="product-count">
          {products.length} Products
        </div>
      </div>

      {products.length === 0 ? (
        <div className="my-products-empty">
          <div className="empty-product-icon">📦</div>

          <h2>No Products Found</h2>

          <p>You haven't added any products yet.</p>

          <button onClick={() => setPage("add-product")}>
            ➕ Add Your First Product
          </button>
        </div>
      ) : (
        <div className="my-products-grid">

          {products.map((product) => (
            <div
              className="my-product-card"
              key={product.id}
            >

              <div className="my-product-image">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.productName}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>

              <div className="my-product-info">

                <span className="my-product-category">
                  {product.category}
                </span>

                <h2>{product.productName}</h2>

                <div className="my-product-price">
                  ৳{product.price}
                </div>

                <div className="my-product-details">
                  <span>
                    Condition:{" "}
                    <strong>{product.condition || "N/A"}</strong>
                  </span>

                  <span>
                    Location:{" "}
                    <strong>{product.location || "N/A"}</strong>
                  </span>
                </div>

                <div className="my-product-actions">

                  <button
                    className="my-view-button"
                    onClick={() =>
                      handleViewProduct(product.id)
                    }
                  >
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "7px",
                      padding: "9px 13px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="my-delete-button"
                    onClick={() =>
                      handleDelete(product.id)
                    }
                  >
                    🗑 Delete
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 9999,
            overflowY: "auto"
          }}
        >

          <div
            style={{
              background: "white",
              width: "100%",
              maxWidth: "550px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "15px",
              padding: "25px",
              margin: "auto"
            }}
          >

            <h2 style={{ marginTop: 0 }}>
              ✏️ Edit Product
            </h2>

            <p style={{ color: "#64748b" }}>
              Update your product information.
            </p>

            <form onSubmit={handleUpdate}>

              <div style={formGroup}>
                <label style={labelStyle}>Product Name</label>
                <input
                  style={inputStyle}
                  type="text"
                  name="productName"
                  value={editForm.productName}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Price (৳)</label>
                <input
                  style={inputStyle}
                  type="number"
                  name="price"
                  min="0"
                  value={editForm.price}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Category</label>
                <select
                  style={inputStyle}
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Books & Notes">Books & Notes</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Sports">Sports</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={inputStyle}
                  name="description"
                  rows="3"
                  value={editForm.description}
                  onChange={handleEditChange}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Condition</label>
                <select
                  style={inputStyle}
                  name="condition"
                  value={editForm.condition}
                  onChange={handleEditChange}
                >
                  <option value="">Select Condition</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Location</label>
                <input
                  style={inputStyle}
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>Image URL</label>
                <input
                  style={inputStyle}
                  type="text"
                  name="image"
                  placeholder="Enter product image URL"
                  value={editForm.image}
                  onChange={handleEditChange}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "22px"
                }}
              >

                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: updating ? "not-allowed" : "pointer",
                    fontWeight: "600"
                  }}
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setEditingProduct(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e5e7eb",
                    color: "#111827",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancel
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const formGroup = {
  marginBottom: "15px"
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
  color: "#334155"
};

const inputStyle = {
  width: "100%",
  padding: "11px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  fontSize: "14px",
  boxSizing: "border-box"
};

export default MyProducts;
