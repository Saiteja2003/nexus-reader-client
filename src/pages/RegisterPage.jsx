// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./AuthForm.module.css";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(email, password);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create Account</h1>
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
            Sign Up
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
