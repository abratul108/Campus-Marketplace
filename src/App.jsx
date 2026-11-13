
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyProducts from "./pages/MyProducts";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import AddProduct from "./pages/AddProduct";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import UserDetails from "./pages/UserDetails";

import AdminDashboard from "./pages/AdminDashboard";
import UsersManagement from "./pages/UsersManagement";
import ProductsManagement from "./pages/ProductsManagement";
import OrdersManagement from "./pages/OrdersManagement";

import { auth, db } from "./firebase";
import { addProductToCart } from "./cartUtils";

import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

function App() {
  const [page, setPage] = useState("login");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkUser = async (user, shouldNavigate = true) => {
    if (!user) {
      setUserRole(null);

      if (shouldNavigate) {
        setPage("login");
      }

      setAuthLoading(false);
      return;
    }

    try {
      await user.reload();

      const currentUser = auth.currentUser;

      if (!currentUser?.emailVerified) {
        if (shouldNavigate) {
          setUserRole(null);
          setPage("login");
        }

        setAuthLoading(false);
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      let role = "buyer";

      if (userSnap.exists()) {
        role = userSnap.data().role || "buyer";

        try {
          await updateDoc(userRef, {
            emailVerified: true
          });
        } catch (error) {
          console.log("User update error:", error);
        }
      }

      setUserRole(role);

      const destination =
        role === "admin" ? "admin-dashboard" : "home";

      if (shouldNavigate) {
        setPage(destination);
      } else {
        setPage((currentPage) =>
          currentPage === "login" ? destination : currentPage
        );
      }

    } catch (error) {
      console.error("Authentication error:", error);

      if (shouldNavigate) {
        setUserRole(null);
        setPage("login");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkUser(user, true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkVerification = async () => {
      if (document.visibilityState === "hidden") return;

      const user = auth.currentUser;

      if (user) {
        await checkUser(user, false);

        if (window.location.search.includes("verified=1")) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
    };

    window.addEventListener("focus", checkVerification);
    document.addEventListener("visibilitychange", checkVerification);

    return () => {
      window.removeEventListener("focus", checkVerification);
      document.removeEventListener("visibilitychange", checkVerification);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [page, selectedProductId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUserRole(null);
      setPage("login");
      setSelectedProductId(null);
      setSearch("");
      setCategory("All");

    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const openProductDetails = (productId) => {
    setSelectedProductId(productId);
    setPage("product-details");
  };

  const handleAddToCart = async (productId) => {
    await addProductToCart(productId);
  };

  const showNavbar = [
    "home",
    "product-details",
    "wishlist",
    "my-products",
    "add-product",
    "cart",
    "my-orders",
    "user-details"
  ].includes(page);

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px",
          color: "#334155"
        }}
      >
        Loading Campus Marketplace...
      </div>
    );
  }

  const showUserLayout =
    showNavbar && userRole !== "admin";

  return (
    <div className="app">

      {showUserLayout && (
        <Navbar
          page={page}
          setPage={setPage}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          handleLogout={handleLogout}
        />
      )}

      <div className={showUserLayout ? "page-content" : ""}>

        {page === "login" && (
          <Login setPage={setPage} />
        )}

        {page === "register" && (
          <Register setPage={setPage} />
        )}

        {/* Marketplace for Buyers and Admin */}
        {page === "home" && userRole !== null && (
          <Home
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            openProductDetails={openProductDetails}
            addToCart={handleAddToCart}
            setPage={setPage}
            isAdmin={userRole === "admin"}
          />
        )}

        {/* Product Details - Buyer Only */}
        {page === "product-details" && userRole !== "admin" && (
          <ProductDetails
            productId={selectedProductId}
            selectedProductId={selectedProductId}
            setPage={setPage}
            addToCart={handleAddToCart}
          />
        )}

        {/* User Details */}
        {page === "user-details" && userRole !== null && (
          <UserDetails />
        )}

        {/* Cart */}
        {page === "cart" && userRole !== "admin" && (
          <Cart setPage={setPage} />
        )}

        {/* My Orders */}
        {page === "my-orders" && userRole !== "admin" && (
          <MyOrders setPage={setPage} />
        )}

        {/* Wishlist */}
        {page === "wishlist" && userRole !== "admin" && (
          <Wishlist
            setPage={setPage}
            setSelectedProduct={setSelectedProductId}
          />
        )}

        {/* My Products */}
        {page === "my-products" && userRole !== "admin" && (
          <MyProducts
            setPage={setPage}
            setSelectedProduct={setSelectedProductId}
          />
        )}

        {/* Add Product */}
        {page === "add-product" && userRole !== "admin" && (
          <AddProduct setPage={setPage} />
        )}

        {/* Admin Dashboard */}
        {page === "admin-dashboard" && userRole === "admin" && (
          <AdminDashboard
            handleLogout={handleLogout}
            setPage={setPage}
          />
        )}

        {/* Users Management */}
        {page === "users-management" && userRole === "admin" && (
          <UsersManagement setPage={setPage} />
        )}

        {/* Products Management */}
        {page === "products-management" && userRole === "admin" && (
          <ProductsManagement setPage={setPage} />
        )}

        {/* Orders Management */}
        {page === "orders-management" && userRole === "admin" && (
          <OrdersManagement setPage={setPage} />
        )}

      </div>
    </div>
  );
}

export default App;
