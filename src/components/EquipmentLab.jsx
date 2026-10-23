/** 3D Equipment Lab section: mounts the imperative Three.js carousel. */
import { useEffect, useRef } from 'react';
import { EquipmentCarousel } from './EquipmentCarousel.js';
import { useGameState } from '../context/GameStateContext.jsx';

export default function EquipmentLab() {
    const { addXP } = useGameState();
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;
        const carousel = new EquipmentCarousel({ container, onXPBonus: (xp, el) => addXP(xp, el) });
        return () => carousel.destroy();
    }, [addXP]);

    return (
        <section className="section-spacing" id="equipment" aria-labelledby="equipment-heading">
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <span className="section-label">Interactive 3D Armory</span>
                    <h2 className="section-title" id="equipment-heading">Competition equipment</h2>
                    <p className="section-desc">
                        Inspect our competition-spec gear in real-time 3D. Precision knurled barbells, calibrated bumper plates,
                        heavy dumbbells, and high-performance nutrition. Drag to rotate 360°.
                    </p>
                </div>

                <div ref={containerRef} className="reveal-init"></div>
            </div>
        </section>
    );
}
