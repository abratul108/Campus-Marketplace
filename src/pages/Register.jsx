
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Register.css";

function Register({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordRules = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8
  };

  const allPasswordRulesValid =
    passwordRules.lowercase &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special &&
    passwordRules.length;

  // Registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!allPasswordRulesValid) {
      setError("Please fulfill all password requirements.");
      return;
    }

    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // Only buyer or seller can register.
      // Admin role must be assigned separately.
      const selectedRole =
        role === "seller" ? "seller" : "buyer";

      // Save user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: user.email,
        dateOfBirth,
        phone: phone.trim(),
        role: selectedRole,
        emailVerified: false,
        createdAt: new Date()
      });

      const actionCodeSettings = {
        url: `${window.location.origin}/?verified=1`,
        handleCodeInApp: false
      };

      await sendEmailVerification(
        user,
        actionCodeSettings
      );

      setSuccess(
        "Account created! Open your verification email and click the link. Return to this website in the same browser to continue."
      );

    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else if (
        error.code === "auth/unauthorized-continue-uri"
      ) {
        setError(
          "Website domain is not authorized in Firebase Authentication settings."
        );
      } else {
        setError(error.message);
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <h1>Create your account</h1>
          <p>Campus Marketplace</p>
        </div>

        <form onSubmit={handleRegister}>

          <div className="register-form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-grid">

            <div className="register-form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) =>
                  setDateOfBirth(e.target.value)
                }
                required
              />
            </div>

            <div className="register-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="register-form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="password-rules">

              <p className={passwordRules.lowercase ? "valid" : "invalid"}>
                {passwordRules.lowercase ? "✓" : "○"} Lowercase
              </p>

              <p className={passwordRules.uppercase ? "valid" : "invalid"}>
                {passwordRules.uppercase ? "✓" : "○"} Uppercase
              </p>

              <p className={passwordRules.number ? "valid" : "invalid"}>
                {passwordRules.number ? "✓" : "○"} Number
              </p>

              <p className={passwordRules.special ? "valid" : "invalid"}>
                {passwordRules.special ? "✓" : "○"} Special
              </p>

              <p className={passwordRules.length ? "valid" : "invalid"}>
                {passwordRules.length ? "✓" : "○"} 8+ chars
              </p>

            </div>
          </div>

          <div className="role-section">
            <label className="role-title">
              Register as
            </label>

            <div className="role-options">

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === "buyer"}
                  onChange={() => setRole("buyer")}
                />
                Buyer
              </label>

              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={role === "seller"}
                  onChange={() => setRole("seller")}
                />
                Seller
              </label>

            </div>
          </div>

          {error && (
            <p className="register-error">
              {error}
            </p>
          )}

          {success && (
            <p className="register-success">
              {success}
            </p>
          )}

          <button
            className="register-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

        </form>

        <div className="login-link">
          Already have an account?

          <button
            type="button"
            onClick={() => setPage("login")}
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;
