/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect } from "react";
import { auth, provider, database } from "../firebase-config";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import useAuth from "../services/useAuth";
import { useNavigate } from "react-router-dom";

// Your custom design system components
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Icon, { ICONS } from "../components/ui/Icon";
import Logo from "../components/ui/Logo";

/* ─── Logout ───────────────────────────────────────────────── */
function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut(auth);
        sessionStorage.removeItem("google_access_token");
        sessionStorage.removeItem("user");
        navigate("/");
      } catch (error) {
        console.error("Sign-Out Error:", error);
      }
    };
    handleSignOut();
  }, []);

  return (
    <div style={styles.centered}>
      <Logo size={40} />
      <p style={styles.signingOut}>Signing out…</p>
    </div>
  );
}

/* ─── Login ─────────────────────────────────────────────────── */
function Login() {
  const { user, isRegistered, loading, setIsRegistered } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  useEffect(() => {
    if (user && isRegistered) {
      sessionStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }));
      navigate("/dashboard");
    }
  }, [user, isRegistered]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      if (token) {
        sessionStorage.setItem("google_access_token", token);
      }
      /* 
      if (!result.user.email.endsWith("@augustana.edu")) {
        await signOut(auth);
        alert("Please use your Augustana school email to sign in.");
        return;
      } */

      const emailKey = result.user.email.toLowerCase();
      const snap = await getDocs(collection(database, "users"));
      const existingUser = snap.docs.find((d) => d.data().email === emailKey);
      if (existingUser) {
        setIsRegistered(true);
        navigate("/dashboard");
      }
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
        }),
      );
    } catch (error) {
      console.error("Sign-In Error:", error);
    }
  };

  const handleRegister = async () => {
    if (!user) return;

    const emailKey = user.email.toLowerCase();
    const userRef = doc(database, "users", user.uid);

    try {
      const snap = await getDocs(collection(database, "users"));
      const existingUser = snap.docs.find((d) => d.data().email === emailKey);

      await setDoc(userRef, {
        name: user.displayName,
        email: emailKey,
        phone: phoneNumber,
        createdAt: new Date(),
      });

      setIsRegistered(true);
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    const len = digits.length;
    if (len < 4) return digits;
    if (len < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <Logo size={40} />
        <p style={styles.signingOut}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── Sign-in card ── */}
      {!user && (
        <div style={styles.cardWrap}>
          <Card style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
              <Logo size={48} />
              <h1 style={styles.title}>FinLit</h1>
              <Badge tone="primary">Augustana Portal</Badge>
            </div>

            <p style={styles.subtitle}>
              Sign in with your Google account to access your financial
              dashboard and coaching tools.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSignIn}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Icon d={ICONS.send} size={16} />
              Sign in with Google
            </Button>

            <p style={styles.hint}>
              <Icon d={ICONS.lock} size={13} stroke={2} />
              Your information is secure and will not be shared with third
              parties.
            </p>
          </Card>
        </div>
      )}

      {/* ── Registration card ── */}
      {user && !isRegistered && (
        <div style={styles.cardWrap}>
          <Card style={styles.card}>
            <div style={styles.header}>
              <Logo size={48} />
              <h1 style={styles.title}>Complete Registration</h1>
              <Badge tone="info">New Account</Badge>
            </div>

            <p style={styles.subtitle}>
              Welcome, <strong>{user.displayName}</strong>! Add your phone
              number to finish setting up your account.
            </p>

            <input
              type="tel"
              placeholder="000-000-0000"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(formatPhoneNumber(e.target.value))
              }
              style={styles.input}
            />

            <Button
              variant="primary"
              size="lg"
              onClick={handleRegister}
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            >
              <Icon d={ICONS.check} size={16} />
              Complete Registration
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg, #F5F5F0)",
    padding: 24,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 36,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    color: "var(--fg-1, #1a1a1a)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "var(--fg-2, #666)",
    textAlign: "center",
    lineHeight: 1.6,
  },
  hint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    fontSize: 12,
    color: "var(--fg-2, #888)",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 15,
    border: "1px solid var(--ink-200, #ddd)",
    borderRadius: 10,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "var(--bg, #fff)",
    color: "var(--fg-1, #1a1a1a)",
  },
  centered: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "var(--bg, #F5F5F0)",
  },
  signingOut: {
    fontSize: 15,
    color: "var(--fg-2, #888)",
  },
};

export { Login, Logout };
