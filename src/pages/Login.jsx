
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

import { auth } from "../firebase";
import "./Login.css";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Email and Password Login
  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      if (!user.emailVerified) {
        await auth.signOut();

        setError(
          "Please verify your email before logging in."
        );
        return;
      }

      setSuccess("Login successful!");
      setPage("home");

    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log(
        "Logged in user:",
        result.user.email
      );

      setSuccess("Google login successful!");
      setPage("home");

    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setError(
          "Popup blocked. Please allow popups and try again."
        );
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim()
      );

      setSuccess(
        "Password reset link sent! Please check your email inbox or spam folder."
      );

    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Email
  const resendVerification = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      if (userCredential.user.emailVerified) {
        setError("Your email is already verified.");
        return;
      }

      await sendEmailVerification(
        userCredential.user
      );

      setSuccess(
        "Verification email sent again. Please check your inbox or spam folder."
      );

      await auth.signOut();

    } catch {
      setError(
        "Unable to resend verification email. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Welcome back</h1>
          <p>Campus Marketplace</p>
        </div>

        {/* Google Login */}
        <button
          className="google-login-button"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : "Continue with Google"}
        </button>

        <div className="login-divider">
          <span>OR</span>
        </div>

        {/* Email and Password Login */}
        <form onSubmit={handleLogin}>

          <div className="login-form-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "8px" }}>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              style={{
                border: "none",
                background: "none",
                color: "#059669",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
                padding: "5px 0"
              }}
            >
              Forgot Password?
            </button>
          </div>

          {error && (
            <p className="login-error">{error}</p>
          )}

          {success && (
            <p className="login-success">
              {success}
            </p>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Please wait..." : "Sign in"}
          </button>

        </form>

        {error ===
          "Please verify your email before logging in." && (
          <button
            className="resend-button"
            type="button"
            onClick={resendVerification}
            disabled={loading}
          >
            Resend Verification Email
          </button>
        )}

        <div className="register-link">
          Don't have an account?

          <button
            type="button"
            onClick={() => setPage("register")}
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
