import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

const errorMessages = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (values.username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!/^\S+@\S+\.\S+$/.test(values.email))
      errs.email = "Please enter a valid email.";
    if (values.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (values.password !== values.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await register(values.username.trim(), values.email, values.password);
      navigate("/groups");
    } catch (err) {
      console.log("Register error:", err.code, err.message);
      setServerError(errorMessages[err.code] || "Registration failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Register</h1>

        {serverError && <p className="error-banner">{serverError}</p>}

        <label htmlFor="username">Username</label>
        <input id="username" name="username" value={values.username} onChange={handleChange} />
        {errors.username && <p className="field-error">{errors.username}</p>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
        {errors.email && <p className="field-error">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={values.password} onChange={handleChange} />
        {errors.password && <p className="field-error">{errors.password}</p>}

        <label htmlFor="confirmPassword">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}

export default Register;