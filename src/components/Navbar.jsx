
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import "./Navbar.css";

function Navbar({
  page,
  setPage,
  search,
  setSearch,
  category,
  setCategory,
  handleLogout
}) {
  const [cartCount, setCartCount] = useState(0);

  const userName =
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split("@")[0] ||
    "Student";

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setCartCount(0);
      return;
    }

    const cartRef = collection(
      db,
      "users",
      user.uid,
      "cart"
    );

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const total = snapshot.docs.reduce(
          (sum, item) =>
            sum + Number(item.data().quantity || 0),
          0
        );

        setCartCount(total);
      },
      (error) => {
        console.error("Cart count error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const menuItems = [
    { name: "Dashboard", page: "dashboard", icon: "🏠" },
    { name: "Marketplace", page: "home", icon: "🛍️" },
    { name: "User Details", page: "user-details", icon: "👤" },
    { name: "Add Product", page: "add-product", icon: "➕" },
    { name: "Wishlist", page: "wishlist", icon: "❤️" },
    { name: "My Products", page: "my-products", icon: "📦" },
    { name: "My Cart", page: "cart", icon: "🛒" },
    { name: "My Orders", page: "my-orders", icon: "📋" }
  ];

  const activeItem =
    page === "home" || page === "product-details"
      ? "Marketplace"
      : page === "dashboard"
      ? "Dashboard"
      : menuItems.find((item) => item.page === page)?.name;

  const handleMenuClick = (item) => {
    if (item.page === "dashboard" || item.page === "home") {
      setPage("home");
      setCategory("All");
      setSearch("");
      return;
    }

    setPage(item.page);
  };

  return (
    <div className="marketplace-layout">

      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">🛍️</div>

          <div className="logo-text">
            <h2>Campus Market</h2>
            <span>Marketplace System</span>
          </div>
        </div>

        <nav className="sidebar-menu">

          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`menu-item ${
                activeItem === item.name ? "active" : ""
              }`}
              onClick={() => handleMenuClick(item)}
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>

              {item.page === "cart" && cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            type="button"
            onClick={handleLogout}
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>

      <main className="main-area">

        <header className="top-header">

          <div className="header-left">
            <div className="header-title">
              <h3>{activeItem || "Dashboard"}</h3>
              <span>Welcome to Campus Marketplace</span>
            </div>
          </div>

          <div className="header-right">

            <div className="navbar-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage("home");
                }}
              />
            </div>

            <button
              className="header-icon"
              type="button"
              title="Notifications"
            >
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="user-profile">

              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="user-info">
                <strong>{userName}</strong>
                <span>Student</span>
              </div>

            </div>

          </div>

        </header>

      </main>

    </div>
  );
}

export default Navbar;
