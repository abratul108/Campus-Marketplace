
import React, { useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./AddProduct.css";

function AddProduct({ setPage }) {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    price: "",
    category: "Books & Notes",
    image: "",
    condition: "Good",
    location: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      alert("Please login first.");
      setPage("login");
      return;
    }

    if (Number(form.price) <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    setLoading(true);

    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};

      await addDoc(collection(db, "products"), {
        ...form,
        price: Number(form.price),
        sellerId: user.uid,
        sellerName: userData.name || user.displayName || user.email,
        createdAt: serverTimestamp(),
      });

      alert("Product added successfully!");
      setPage("home");
    } catch (error) {
      console.error("Add product error:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <button className="add-back-btn" onClick={() => setPage("home")}>
        ← Back to Marketplace
      </button>

      <form className="add-product-form" onSubmit={handleSubmit}>
        <h1>Add New Product</h1>
        <p>Fill in the details of the product you want to sell.</p>

        <label>Product Name</label>
        <input
          name="productName"
          value={form.productName}
          onChange={handleChange}
          placeholder="Enter product name"
          required
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your product"
          required
        />

        <label>Price (৳)</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          min="1"
          placeholder="Enter price"
          required
        />

        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          <option>Books & Notes</option>
          <option>Electronics</option>
          <option>Lab Equipment</option>
          <option>Study Material</option>
        </select>

        <label>Image URL</label>
        <input
          name="image"
          type="url"
          value={form.image}
          onChange={handleChange}
          placeholder="Paste an image URL"
        />

        <label>Condition</label>
        <select
          name="condition"
          value={form.condition}
          onChange={handleChange}
        >
          <option>New</option>
          <option>Like New</option>
          <option>Good</option>
          <option>Used</option>
        </select>

        <label>Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. University Campus"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
