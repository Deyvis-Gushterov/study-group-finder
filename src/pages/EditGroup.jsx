import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getGroupById, updateGroup } from "../services/groupService";
import GroupForm from "../components/GroupForm";
import Spinner from "../components/Spinner";
import ErrorMessage from "../components/ErrorMessage";

function EditGroup() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getGroupById(id);
        if (!cancelled) setGroup(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load this group.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!group)
    return (
      <section className="page">
        <h1>Group not found</h1>
        <Link to="/groups">Back to all groups</Link>
      </section>
    );

  // Only the author may edit
  if (group.ownerId !== user.uid) return <Navigate to={`/groups/${id}`} replace />;

  const handleUpdate = async (values) => {
    await updateGroup(id, values);
    navigate(`/groups/${id}`);
  };

  return (
    <GroupForm
      title="Edit study group"
      initialValues={{
        title: group.title,
        subject: group.subject,
        description: group.description,
        location: group.location,
        schedule: group.schedule,
      }}
      onSubmit={handleUpdate}
      submitLabel="Save changes"
      submittingLabel="Saving..."
    />
  );
}

export default EditGroup;