
import React, { useEffect, useState } from "react";
import "./Home.css";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Home({
  search,
  setSearch,
  category,
  setCategory,
  openProductDetails,
  addToCart,
  setPage,
  isAdmin = false
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 12;

  const categories = [
    {
      icon: "📚",
      name: "Books & Notes",
      description: "Textbooks, notes and academic books",
    },
    {
      icon: "💻",
      name: "Electronics",
      description: "Calculators, laptops and other devices",
    },
    {
      icon: "🔬",
      name: "Lab Equipment",
      description: "Lab tools and practical equipment",
    },
    {
      icon: "📖",
      name: "Study Material",
      description: "Academic and learning materials",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "products")
        );

        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const productName =
      product.productName?.toLowerCase() || "";

    const description =
      product.description?.toLowerCase() || "";

    const searchText = search.toLowerCase();

    const matchesSearch =
      productName.includes(searchText) ||
      description.includes(searchText);

    const matchesCategory =
      category === "All" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort(
    (a, b) => {
      if (sortBy === "priceLow") {
        return Number(a.price || 0) - Number(b.price || 0);
      }

      if (sortBy === "priceHigh") {
        return Number(b.price || 0) - Number(a.price || 0);
      }

      if (sortBy === "newest") {
        const dateA = a.createdAt?.toDate
          ? a.createdAt.toDate()
          : new Date(a.createdAt || 0);

        const dateB = b.createdAt?.toDate
          ? b.createdAt.toDate()
          : new Date(b.createdAt || 0);

        return dateB - dateA;
      }

      return 0;
    }
  );

  const totalPages = Math.ceil(
    sortedProducts.length / productsPerPage
  );

  const startIndex =
    (currentPage - 1) * productsPerPage;

  const endIndex =
    startIndex + productsPerPage;

  const currentProducts = sortedProducts.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortBy]);

  return (
    <div className="home">

      {isAdmin && (
        <div style={{ padding: "20px 30px 0" }}>
          <button
            onClick={() => setPage("admin-dashboard")}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "11px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      )}

      <section className="hero">
        <div className="hero-content">
          <h1>Campus Marketplace</h1>

          <p>
            Buy and sell books, electronics, lab equipment
            and study materials within your campus.
          </p>

          <div className="home-search">
            <input
              type="text"
              placeholder="Search for books, electronics, study materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button>Search</button>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <h2>Browse Categories</h2>
          <p>Find what you need from our marketplace</p>
        </div>

        <div className="categories-grid">

          <div
            className={`category-card ${
              category === "All" ? "active" : ""
            }`}
            onClick={() => setCategory("All")}
          >
            <div className="category-icon">🛍️</div>
            <h3>All Products</h3>
            <p>Browse all available products</p>
            <button>Explore →</button>
          </div>

          {categories.map((item) => (
            <div
              className={`category-card ${
                category === item.name ? "active" : ""
              }`}
              key={item.name}
              onClick={() => setCategory(item.name)}
            >
              <div className="category-icon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <button>Explore →</button>
            </div>
          ))}

        </div>
      </section>

      <section className="products-section">

        <div className="products-header">
          <div className="section-heading">
            <h2>
              {category === "All"
                ? "Latest Products"
                : category}
            </h2>

            <p>
              {loading
                ? "Loading products..."
                : `Showing ${
                    sortedProducts.length === 0
                      ? 0
                      : startIndex + 1
                  }-${
                    Math.min(endIndex, sortedProducts.length)
                  } of ${sortedProducts.length} products`}
            </p>
          </div>

          {!loading && sortedProducts.length > 0 && (
            <div className="sort-box">
              <label>Sort By</label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="priceLow">Price: Low → High</option>
                <option value="priceHigh">Price: High → Low</option>
              </select>
            </div>
          )}
        </div>

        {loading && (
          <div className="empty-products">
            <h3>Loading products...</h3>
            <p>Please wait while we load the marketplace.</p>
          </div>
        )}

        {!loading && currentProducts.length > 0 && (
          <div className="products-grid">
            {currentProducts.map((product) => (
              <div
                className="product-card"
                key={product.id}
                onClick={() => openProductDetails(product.id)}
              >
                <div className="product-image">
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

                <div className="product-info">

                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.productName}</h3>

                  <p className="product-description">
                    {product.description}
                  </p>

                  <div className="product-price">
                    ৳{product.price}
                  </div>

                  <div className="product-condition">
                    Condition: {product.condition || "Not specified"}
                  </div>

                  <div className="product-seller">
                    Seller: {product.sellerName || "Seller"}
                  </div>

                  <button
                    className="contact-seller"
                    onClick={(e) => {
                      e.stopPropagation();
                      openProductDetails(product.id);
                    }}
                  >
                    View Details →
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      style={{
                        width: "100%",
                        marginTop: "9px",
                        padding: "11px",
                        border: "none",
                        borderRadius: "7px",
                        background: "#059669",
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sortedProducts.length === 0 && (
          <div className="empty-products">
            <h3>No products found</h3>
            <p>
              Try another search or select a different category.
            </p>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="pagination">

            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Previous
            </button>

            <div className="page-numbers">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`page-number ${
                    currentPage === pageNumber ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next →
            </button>

          </div>
        )}

      </section>
    </div>
  );
}

export default Home;
