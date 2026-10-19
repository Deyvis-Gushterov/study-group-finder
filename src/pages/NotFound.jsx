import { Link } from "react-router-dom";
import "../styles/groups.css";

function NotFound() {
  return (
    <section className="page">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go to the home page</Link>
    </section>
  );
}

export default NotFound;