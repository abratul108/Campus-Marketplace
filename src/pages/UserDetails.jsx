
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function UserDetails() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setError("Please login to view your details.");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData({
            ...userSnap.data(),
            email: userSnap.data().email || currentUser.email,
            emailVerified: currentUser.emailVerified
          });
        } else {
          setError("User information not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load user information.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const value = date.toDate ? date.toDate() : new Date(date);

    if (isNaN(value.getTime())) return "Not available";

    return value.toLocaleDateString("en-GB");
  };

  const details = [
    ["Full Name", userData?.name],
    ["Email Address", userData?.email],
    ["Phone Number", userData?.phone],
    ["Date of Birth", formatDate(userData?.dateOfBirth)],
    ["Account Role", userData?.role],
    ["Email Verification", userData?.emailVerified ? "Verified" : "Not Verified"],
    ["Account Created", formatDate(userData?.createdAt)]
  ];

  if (loading) {
    return <div style={styles.message}>Loading user details...</div>;
  }

  if (error) {
    return <div style={styles.message}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {(userData?.name || "U").charAt(0).toUpperCase()}
          </div>

          <h2>{userData?.name || "User"}</h2>
          <p>{userData?.email}</p>
          <span style={styles.role}>
            {(userData?.role || "buyer").toUpperCase()}
          </span>
        </div>

        <h3 style={styles.title}>Personal Information</h3>

        <div>
          {details.map(([label, value]) => (
            <div key={label} style={styles.infoRow}>
              <span style={styles.label}>{label}</span>
              <span style={styles.value}>{value || "Not available"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "35px 20px",
    minHeight: "80vh",
    background: "#f5f7fb"
  },
  card: {
    maxWidth: "750px",
    margin: "0 auto",
    padding: "30px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
  },
  header: {
    textAlign: "center",
    paddingBottom: "25px",
    borderBottom: "1px solid #e5e7eb"
  },
  avatar: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    background: "#059669",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "bold",
    margin: "0 auto 15px"
  },
  role: {
    display: "inline-block",
    marginTop: "10px",
    padding: "6px 16px",
    borderRadius: "20px",
    background: "#d1fae5",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "bold"
  },
  title: {
    marginTop: "25px",
    marginBottom: "15px",
    color: "#111827"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    padding: "15px 5px",
    borderBottom: "1px solid #e5e7eb",
    flexWrap: "wrap"
  },
  label: {
    color: "#6b7280",
    fontWeight: "600"
  },
  value: {
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    overflowWrap: "anywhere"
  },
  message: {
    padding: "50px",
    textAlign: "center",
    fontSize: "18px"
  }
};

export default UserDetails;
