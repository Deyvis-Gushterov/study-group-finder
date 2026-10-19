import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllGroups } from "../services/groupService";
import { useAuth } from "../hooks/useAuth";
import GroupCard from "../components/GroupCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/groups.css";

function Home() {
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAllGroups();
        if (!cancelled) setGroups(data.slice(0, 3));
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load the latest groups.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="page">
      <div className="hero">
        <h1>Study better, together</h1>
        <p>
          Find a study group for your subject, join it, or start your own and
          invite others to study with you.
        </p>
        <div className="hero-actions">
          <Link to="/groups" className="btn btn-primary">Browse groups</Link>
          {isAuthenticated ? (
            <Link to="/groups/create" className="btn">Create a group</Link>
          ) : (
            <Link to="/register" className="btn">Sign up</Link>
          )}
        </div>
      </div>

      <h2>Latest groups</h2>
      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && groups.length === 0 && <p>No groups yet.</p>}
      {!loading && !error && groups.length > 0 && (
        <div className="group-grid">
          
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Home;