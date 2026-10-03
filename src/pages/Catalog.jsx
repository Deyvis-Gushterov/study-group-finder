import { useEffect, useState } from "react";
import { getAllGroups } from "../services/groupService";
import GroupCard from "../components/GroupCard";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/groups.css";

function Catalog() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAllGroups();
        if (!cancelled) setGroups(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load groups. Please try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <section className="page">
      <h1>Study groups</h1>
      {groups.length === 0 ? (
        <p>No groups yet. Be the first to create one!</p>
      ) : (
        <div className="group-grid">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Catalog;