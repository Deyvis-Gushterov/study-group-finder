import { Link } from "react-router-dom";

function GroupCard({ group }) {
  return (
    <article className="group-card">
      <h2>{group.title}</h2>
      <p className="group-subject">{group.subject}</p>
      <p>{group.schedule} · {group.location}</p>
      <p className="group-meta">
        {group.members?.length || 0} member(s) · by {group.ownerName}
      </p>
      <Link to={`/groups/${group.id}`}>View details</Link>
    </article>
  );
}

export default GroupCard;