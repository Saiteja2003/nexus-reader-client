// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import styles from "./AuthForm.module.css";

function LoginPage() {
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
      await loginUser(email, password);
      navigate("/prepare");
    } catch (err) {
      setError(err.message || "Invalid login credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginUser("saitejachalla98@gmail.com", "Saiteja@1");
      navigate("/prepare");
    } catch (err) {
      setError(`Test user login failed: ${err.message}`);
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
          <h1 className={styles.title}>Welcome Back</h1>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              autoComplete="current-password"
              type="password"
              placeholder="••••••••"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? "Signing in..." : "Log In"}
          </button>
        </form>

        {import.meta.env.DEV && (
          <button
            onClick={handleDevLogin}
            className={`${styles.button} ${styles.devButton}`}
            disabled={isLoading}
          >
            Log In as Test User
          </button>
        )}

        <p className={styles.link}>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
