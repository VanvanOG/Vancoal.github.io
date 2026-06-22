import { Mail, Send } from "lucide-react";
import { profile } from "../data/profile";
import ControllerHints from "./ControllerHints";

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="page-shell contact-inner">
        <span className="section-kicker">
          <span className="kicker-line" />
          Contact
        </span>
        <h2 id="contact-title">Ready for the next interaction system.</h2>
        <p>
          基础版暂以邮箱作为主要联系方式。后续可以按投递场景增加 PDF、电话或更多外链入口。
        </p>
        <a className="primary-link contact-mail" href={`mailto:${profile.email}`}>
          <Mail aria-hidden="true" size={19} />
          <span>{profile.email}</span>
          <Send aria-hidden="true" size={18} />
        </a>
        <div className="contact-tags" aria-label="Role tags">
          <span>AI-UCG</span>
          <span>Game UX</span>
          <span>System Design</span>
          <span>Data Evidence</span>
        </div>
      </div>
      <ControllerHints left="RETURN TO TOP" right="SEND MAIL" />
    </section>
  );
}
