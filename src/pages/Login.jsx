import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

const errorMessages = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email)) errs.email = "Please enter a valid email.";
    if (!values.password) errs.password = "Password is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate("/groups");
    } catch (err) {
      setServerError(errorMessages[err.code] || "Login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Login</h1>

        {serverError && <p className="error-banner">{serverError}</p>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={values.password} onChange={handleChange} />
        {errors.password && <p className="field-error">{errors.password}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p>No account yet? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}

export default Login;