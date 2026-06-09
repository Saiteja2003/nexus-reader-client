// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api";
import styles from "./AuthForm.module.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await registerUser(email, password);
      // Supabase auto-logs in after successful registration if email confirmation is disabled
      navigate("/prepare");
    } catch (err) {
      // Expose exact Supabase errors to fix the "not working" confusion
      setError(
        err.message || "Registration failed. Please check your details.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formWrapper}>
        <div className={styles.brandHeader}>
          <img
            src="/nr-icon-geometric.svg"
            alt="Nexus Reader"
            className={styles.logo}
          />
          <h1 className={styles.title}>Create Account</h1>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              name="email"
              autoComplete="email"
              type="email"
              placeholder="you@example.com"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              autoComplete="new-password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className={styles.link}>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
