import { Mail, Send } from "lucide-react";
import { profile } from "../data/profile";
import ControllerHints from "./ControllerHints";
import MagneticLink from "./MagneticLink";

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="page-shell contact-inner">
        <span className="section-kicker">
          <span className="kicker-line" />
          Contact
        </span>
        <h2 id="contact-title">Let’s make something great together.</h2>
        <p>
          很高兴你看到了这里。如果你有合适的工作机会、想一起做的项目，或只是想聊聊设计，欢迎给我写信。
        </p>
        <MagneticLink className="primary-link contact-mail" href={`mailto:${profile.email}`}>
          <Mail aria-hidden="true" size={19} />
          <span>{profile.email}</span>
          <Send className="contact-send-icon" aria-hidden="true" size={18} />
        </MagneticLink>
        <div className="contact-tags" aria-label="Role tags">
          <span>AI-UCG</span>
          <span>Game UX</span>
          <span>System Design</span>
          <span>Data Evidence</span>
        </div>
      </div>
      <ControllerHints left="SCROLL TO SWITCH PAGES" shortcutPage="contact" />
    </section>
  );
}
