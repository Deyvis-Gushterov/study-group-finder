import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getGroupById, deleteGroup } from "../services/groupService";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/groups.css";


function Details() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const data = await getGroupById(id);
        if (!cancelled) setGroup(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load this group. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
  if (!window.confirm("Delete this group? This cannot be undone.")) return;
  try {
    await deleteGroup(id);
    navigate("/groups");
  } catch (err) {
    console.error(err);
    setActionError("Could not delete the group. Please try again.");
  }
};

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!group)
    return (
      <section className="page">
        <h1>Group not found</h1>
        <Link to="/groups">Back to all groups</Link>
      </section>
    );

  return (
    <section className="page">
      <h1>{group.title}</h1>
      <p className="group-subject">{group.subject}</p>
      <p>{group.description}</p>
      <p><strong>When:</strong> {group.schedule}</p>
      <p><strong>Where:</strong> {group.location}</p>
      <p className="group-meta">
        Created by {group.ownerName} · {group.members?.length || 0} member(s)
      </p>

      {user && user.uid === group.ownerId && (
        <div className="owner-actions">
          <Link to={`/groups/${group.id}/edit`} className="btn">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      )}
      {actionError && <p className="error-banner">{actionError}</p>}

      {!isAuthenticated && (
        <p>
          <Link to="/login">Log in</Link> to join this group.
        </p>
      )}

      <Link to="/groups">← Back to all groups</Link>
    </section>
  );
}

export default Details;