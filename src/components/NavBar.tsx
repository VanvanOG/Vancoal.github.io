import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { profile } from "../data/profile";

const panelLinks = [
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export default function NavBar() {
  return (
    <header className="site-nav" aria-label="Primary navigation">
      <Link className="nav-mark" to="/" aria-label="Go to homepage">
        <span>VANCOAL</span>
        <small>AI + GAME UX</small>
      </Link>
      <nav className="nav-links" aria-label="Page links">
        {panelLinks.map((link) => (
          <Link key={link.id} state={{ targetPanel: link.id }} to="/">
            {link.label}
          </Link>
        ))}
      </nav>
      <a className="nav-contact" href={`mailto:${profile.email}`}>
        <Mail aria-hidden="true" size={17} />
        <span>Mail</span>
      </a>
    </header>
  );
}
