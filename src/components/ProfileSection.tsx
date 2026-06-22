import { profile } from "../data/profile";

export default function ProfileSection() {
  return (
    <section className="profile-section section-band" id="profile" aria-labelledby="profile-title">
      <div className="page-shell profile-grid">
        <div className="section-heading">
          <span className="section-kicker">
            <span className="kicker-line" />
            Profile
          </span>
          <h2 id="profile-title">个人基本资料</h2>
          <p>{profile.intro}</p>
        </div>

        <div className="profile-panel">
          <p className="profile-name">{profile.name}</p>
          <p className="profile-mark">{profile.mark}</p>
          <dl className="fact-list">
            {profile.quickFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="profile-groups">
          {profile.groups.map((group) => (
            <article className="profile-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
