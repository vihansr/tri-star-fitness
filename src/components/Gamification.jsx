/** Level-up system: game idea rows + the interactive Badge Wall (from game state). */
import { useGameState } from '../context/GameStateContext.jsx';

export default function Gamification({ gameIdeas = [], badges = [] }) {
  const { badges: unlockedBadges } = useGameState();
  const unlockedCount = unlockedBadges.length;

  return (
    <section className="section-spacing" id="gamification" aria-labelledby="game-heading">
      <div className="container">
        <div>
          <span className="section-label">Level-up system</span>
          <h2 className="section-title" id="game-heading">Make every visit a level up</h2>
          <p className="section-desc">
            Gamify your training regime. Log reps, maintain consistency streaks, compete on squad leaderboards,
            and unlock milestone bumper plate badges.
          </p>
        </div>

        {/* Game Idea Rows */}
        <div className="game-ideas-list">
          {gameIdeas.map((idea, idx) => (
            <div key={idea.title} className="game-idea-row reveal-init" data-reveal-idx={idx}>
              <div className="bumper-plate-icon" style={{ backgroundColor: idea.accent }} aria-hidden="true">
                <div className="bumper-hole"></div>
              </div>
              <div>
                <h4 className="game-idea-title">{idea.title}</h4>
                <p className="game-idea-desc">{idea.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Badge Wall */}
        <div className="badge-wall-card reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="section-label" style={{ marginBottom: '0.2rem' }}>Trophy Room</span>
              <h3 className="font-heading" style={{ fontSize: '2.2rem', color: 'var(--ink)' }}>Badge Wall</h3>
            </div>
            <span className="badge-tag">{unlockedCount} / {badges.length} Unlocked</span>
          </div>
          <div className="badge-wall-grid">
            {badges.map((b) => {
              const isUnlocked = unlockedBadges.includes(b.id);
              return (
                <div key={b.id} data-badge-id={b.id} className={`badge-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="badge-icon-circle" aria-hidden="true">{b.icon}</div>
                  <h4 className="badge-title">{b.title}</h4>
                  <p className="badge-desc">{b.description}</p>
                  <span className="badge-tag" style={{ marginTop: '0.65rem' }}>
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
