import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getGroupById,
  deleteGroup,
  joinGroup,
  leaveGroup,
} from "../services/groupService";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/groups.css";

function Details() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth(); // Access the authenticated user and their status
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [membershipBusy, setMembershipBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function load() {
      try {
        const data = await getGroupById(id);      // Needed to get details! Do not remove this line. It is used to fetch the group details from the firestore. 
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
    setActionError("");
    try {
        await deleteGroup(id);
       navigate("/groups");
    } catch (err) {
      console.error(err);
      setActionError("Could not delete the group. Please try again.");
    }
  };

    const handleMembership = async () => {
        setActionError("");
        setMembershipBusy(true);
    try {
       const members = group.members || [];
          if (members.includes(user.uid)) {
          await leaveGroup(id, user.uid);
       setGroup((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m !== user.uid),
        }));
      } else {
        await joinGroup(id, user.uid);
        setGroup((prev) => ({
          ...prev,
          members: [...(prev.members || []), user.uid],
        }));
      }
      } catch (err) {
      console.error(err);
        setActionError("Could not update your membership. Please try again.");
        } finally {
        setMembershipBusy(false);
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

  const isOwner = !!user && user.uid === group.ownerId;
  const isMember = !!user && (group.members || []).includes(user.uid);

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

      {isOwner && (
        <div className="owner-actions">
          <Link to={`/groups/${group.id}/edit`} className="btn">Edit</Link>
          <button onClick={handleDelete} className="btn btn-danger">Delete</button>
        </div>
      )}

      {isAuthenticated && !isOwner && (
        <div className="owner-actions">
             <button
            onClick={handleMembership}
            disabled={membershipBusy}
            className={isMember ? "btn" : "btn btn-primary"}
          >
            {membershipBusy ? "Please wait..." : isMember ? "Leave group" : "Join group"}
          </button>
        </div>
      )}

      {isOwner && <p className="group-meta">You organize this group.</p>}

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