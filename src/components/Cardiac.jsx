/** Cardiac health section: mounts the imperative D3 ECG controller. */
import { useEffect, useRef } from 'react';
import { CardiacController } from './CardiacController.js';
import { useGameState } from '../context/GameStateContext.jsx';

export default function Cardiac() {
    const { addXP } = useGameState();
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        const controller = new CardiacController({
            container,
            onXPBonus: (xp, el) => addXP(xp, el),
        });
        return () => controller.destroy();
    }, [addXP]);

    return (
        <section className="section-spacing" id="cardiac" aria-labelledby="cardiac-heading">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <span className="section-label">Conditioning & telemetry</span>
                    <h2 className="section-title" id="cardiac-heading">Cardiac health</h2>
                    <p className="section-desc">
                        Monitor your heart rate zones, aerobic recovery, and training intensity in real time. Whether grinding
                        through high-volume sled pushes or building your aerobic engine, live biofeedback maximizes performance
                        and longevity.
                    </p>
                </div>

                <div ref={containerRef} className="reveal-init"></div>
            </div>
        </section>
    );
}
