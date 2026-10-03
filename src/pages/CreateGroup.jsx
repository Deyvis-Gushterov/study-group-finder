import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createGroup } from "../services/groupService";
import "../styles/auth.css";

function CreateGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    title: "",
    subject: "",
    description: "",
    location: "",
    schedule: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (values.title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
    if (!values.subject.trim()) errs.subject = "Subject is required.";
    if (values.description.trim().length < 10)
      errs.description = "Description must be at least 10 characters.";
    if (!values.location.trim()) errs.location = "Location is required.";
    if (!values.schedule.trim()) errs.schedule = "Schedule is required.";
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
      const id = await createGroup(values, user);
      navigate(`/groups/${id}`);
    } catch (err) {
      console.error(err);
      setServerError("Could not create the group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <h1>Create study group</h1>

        {serverError && <p className="error-banner">{serverError}</p>}

        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={values.title} onChange={handleChange} />
        {errors.title && <p className="field-error">{errors.title}</p>}

        <label htmlFor="subject">Subject</label>
        <input id="subject" name="subject" value={values.subject} onChange={handleChange} />
        {errors.subject && <p className="field-error">{errors.subject}</p>}

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows="4" value={values.description} onChange={handleChange} />
        {errors.description && <p className="field-error">{errors.description}</p>}

        <label htmlFor="location">Location</label>
        <input id="location" name="location" value={values.location} onChange={handleChange} />
        {errors.location && <p className="field-error">{errors.location}</p>}

        <label htmlFor="schedule">Schedule</label>
        <input id="schedule" name="schedule" placeholder="e.g. Tuesdays 18:00" value={values.schedule} onChange={handleChange} />
        {errors.schedule && <p className="field-error">{errors.schedule}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create group"}
        </button>
      </form>
    </div>
  );
}

export default CreateGroup;