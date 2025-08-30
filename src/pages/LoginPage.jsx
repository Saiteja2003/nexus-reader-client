// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthForm.module.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  const handleDevLogin = () => {
    // Use the credentials for a test user you've already registered
    login("test@gmail.com", "Saiteja@1");
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Welcome Back</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className={styles.button}>
            Log In
          </button>
        </form>
        {import.meta.env.DEV && (
          <button
            onClick={handleDevLogin}
            className={`${styles.button} ${styles.devButton}`}
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
