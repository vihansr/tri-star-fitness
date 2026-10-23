/**
 * CARDIAC HEALTH CONTROLLER — D3.js real-time heartbeat waveform.
 * (Port of the original src/cardiac.ts to plain JS; imperative class mounted
 * by the React <Cardiac /> component, which owns its lifecycle.)
 */
import * as d3 from 'd3';
import { ecgSamplePoint, getHeartRateZone, clamp } from '../lib/logic.js';
import { XP_RULES } from '../lib/brand.js';

export class CardiacController {
    constructor({ container, onXPBonus } = {}) {
        this.container = container || null;
        this.onXPBonus = onXPBonus;
        this.currentBPM = 138;
        this.targetBPM = 138;
        this.hasAwardedBonus = false;
        this.animFrameId = null;
        this.lastTime = performance.now();
        this.beatPhase = 0;
        this.dataPoints = [];
        this.pointCounter = 0;
        this.maxPoints = 140;

        if (this.container) {
            this.init();
        }
    }

    init() {
        this.renderLayout();
        this.setupD3Chart();
        this.bindEvents();
        this.startLoop();
    }

    renderLayout() {
        if (!this.container) return;

        this.container.innerHTML = `
      <div class="cardiac-panel">
        <!-- Top Telemetry Header -->
        <div class="cardiac-header">
          <div class="cardiac-title-group">
            <div class="cardiac-status-badge">
              <span class="cardiac-pulse-dot" id="cardiac-pulse-dot" aria-hidden="true"></span>
              <span class="cardiac-live-text">Live ECG telemetry</span>
            </div>
            <h3 class="cardiac-main-heading">Lead II Cardiac Monitor</h3>
          </div>

          <div class="cardiac-bpm-box">
            <div class="cardiac-bpm-num" id="cardiac-bpm-readout">138</div>
            <div class="cardiac-bpm-sub">
              <span class="cardiac-bpm-unit">BPM</span>
              <span class="cardiac-zone-tag" id="cardiac-zone-badge">Zone 2</span>
            </div>
          </div>
        </div>

        <!-- D3 ECG Canvas Container -->
        <div class="cardiac-screen-frame">
          <div class="cardiac-screen-overlay" aria-hidden="true"></div>
          <svg id="cardiac-svg" viewBox="0 0 760 220" preserveAspectRatio="none" role="img" aria-label="Real-time ECG heartbeat line visualization"></svg>
          <div class="cardiac-grid-legend" aria-hidden="true">
            <span>25 mm/s</span>
            <span>10 mm/mV</span>
            <span>HYROX Engine</span>
          </div>
        </div>

        <!-- Zone Selector Buttons -->
        <div class="cardiac-controls">
          <span class="cardiac-controls-label">Select training intensity:</span>
          <div class="cardiac-zones-row" role="group" aria-label="Heart rate training zones">
            <button type="button" class="btn-zone" data-bpm="68" aria-pressed="false">
              <span class="btn-zone-indicator" style="background: var(--plate-blue);"></span>
              <span>Resting (68 BPM)</span>
            </button>
            <button type="button" class="btn-zone" data-bpm="128" aria-pressed="false">
              <span class="btn-zone-indicator" style="background: var(--plate-green);"></span>
              <span>Zone 2 Base (128 BPM)</span>
            </button>
            <button type="button" class="btn-zone active" data-bpm="148" aria-pressed="true">
              <span class="btn-zone-indicator" style="background: var(--plate-yellow);"></span>
              <span>HYROX Tempo (148 BPM)</span>
            </button>
            <button type="button" class="btn-zone" data-bpm="176" aria-pressed="false">
              <span class="btn-zone-indicator" style="background: var(--plate-red);"></span>
              <span>VO2 Max Peak (176 BPM)</span>
            </button>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="cardiac-metrics-grid">
          <div class="cardiac-metric-item">
            <span class="metric-label">Active Zone</span>
            <span class="metric-val" id="metric-zone-label">Zone 3: HYROX tempo</span>
            <span class="metric-desc" id="metric-zone-desc">Builds stamina for continuous ski erg, sled push, and wall ball circuits.</span>
          </div>
          <div class="cardiac-metric-item">
            <span class="metric-label">Heart Rate Variability</span>
            <span class="metric-val" id="metric-hrv-val">74 ms</span>
            <span class="metric-desc">Parasympathetic recovery ready for heavy loaded carries.</span>
          </div>
          <div class="cardiac-metric-item">
            <span class="metric-label">Cardiac Recovery Index</span>
            <span class="metric-val" id="metric-recovery-val">+46 BPM / min</span>
            <span class="metric-desc">Rapid post-set heart rate drop indicates high conditioning.</span>
          </div>
        </div>
      </div>
    `;
    }

    setupD3Chart() {
        const svg = d3.select('#cardiac-svg');
        if (svg.empty()) return;

        svg.selectAll('*').remove();

        const width = 760;
        const height = 220;

        // Defs for glowing filter and gradient
        const defs = svg.append('defs');

        // Glow filter
        const filter = defs.append('filter')
            .attr('id', 'ecg-glow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '2.5')
            .attr('result', 'coloredBlur');
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Linear gradient for fading tail
        const grad = defs.append('linearGradient')
            .attr('id', 'ecg-grad')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
        grad.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#e63027')
            .attr('stop-opacity', '0.2');
        grad.append('stop')
            .attr('offset', '75%')
            .attr('stop-color', '#e63027')
            .attr('stop-opacity', '0.85');
        grad.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ff574d')
            .attr('stop-opacity', '1');

        // Background Millimeter Grid
        const gridG = svg.append('g').attr('class', 'ecg-grid');

        // Minor grid lines
        const minorStep = 12;
        for (let x = 0; x <= width; x += minorStep) {
            gridG.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', height)
                .attr('stroke', 'var(--line)')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.25);
        }
        for (let y = 0; y <= height; y += minorStep) {
            gridG.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
                .attr('stroke', 'var(--line)')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.25);
        }

        // Major grid lines (every 60px)
        const majorStep = 60;
        for (let x = 0; x <= width; x += majorStep) {
            gridG.append('line')
                .attr('x1', x)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', height)
                .attr('stroke', 'var(--line)')
                .attr('stroke-width', 1.2)
                .attr('opacity', 0.5);
        }
        for (let y = 0; y <= height; y += majorStep) {
            gridG.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', width)
                .attr('y2', y)
                .attr('stroke', 'var(--line)')
                .attr('stroke-width', 1.2)
                .attr('opacity', 0.5);
        }

        // Baseline Center Reference Axis
        gridG.append('line')
            .attr('x1', 0)
            .attr('y1', height / 2)
            .attr('x2', width)
            .attr('y2', height / 2)
            .attr('stroke', 'var(--plate-red)')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4 4')
            .attr('opacity', 0.35);

        // Initial flat data buffer
        this.dataPoints = [];
        for (let i = 0; i < this.maxPoints; i++) {
            this.dataPoints.push({ id: this.pointCounter++, voltage: 0 });
        }

        // Path element for the ECG waveform
        svg.append('path')
            .attr('id', 'ecg-path')
            .attr('fill', 'none')
            .attr('stroke', 'url(#ecg-grad)')
            .attr('stroke-width', 2.8)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('filter', 'url(#ecg-glow)');

        // Leading Pulse Head Point
        svg.append('circle')
            .attr('id', 'ecg-head-dot')
            .attr('r', 4.5)
            .attr('fill', '#ffffff')
            .attr('stroke', '#e63027')
            .attr('stroke-width', 2)
            .attr('filter', 'url(#ecg-glow)');
    }

    bindEvents() {
        if (!this.container) return;

        const zoneButtons = this.container.querySelectorAll('.btn-zone');
        this.onZoneClick = (event) => {
            zoneButtons.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            const btn = event.currentTarget;
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const newBPM = parseInt(btn.getAttribute('data-bpm') || '138', 10);
            this.targetBPM = newBPM;

            if (!this.hasAwardedBonus && this.onXPBonus) {
                this.hasAwardedBonus = true;
                this.onXPBonus(XP_RULES.CARDIAC_ZONE, btn);
            }
        };

        zoneButtons.forEach((btn) => {
            btn.addEventListener('click', this.onZoneClick);
        });
    }

    startLoop() {
        const svg = d3.select('#cardiac-svg');
        const path = svg.select('#ecg-path');
        const headDot = svg.select('#ecg-head-dot');
        const bpmReadout = document.getElementById('cardiac-bpm-readout');
        const zoneBadge = document.getElementById('cardiac-zone-badge');
        const zoneLabel = document.getElementById('metric-zone-label');
        const zoneDesc = document.getElementById('metric-zone-desc');
        const hrvVal = document.getElementById('metric-hrv-val');
        const recoveryVal = document.getElementById('metric-recovery-val');
        const pulseDot = document.getElementById('cardiac-pulse-dot');

        const width = 760;
        const height = 220;
        const midY = height / 2;
        const scaleY = 70; // peak height in pixels

        // D3 scales
        const xScale = d3.scaleLinear().domain([0, this.maxPoints - 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([-1.2, 1.2]).range([height - 10, 10]);
        void midY;
        void scaleY;

        const lineGenerator = d3.line()
            .x((_, i) => xScale(i))
            .y((d) => yScale(d.voltage))
            .curve(d3.curveMonotoneX);

        const tick = (now) => {
            const dt = Math.min((now - this.lastTime) / 1000, 0.08) || 0.016;
            this.lastTime = now;

            // Smoothly interpolate current BPM towards target BPM
            this.currentBPM += (this.targetBPM - this.currentBPM) * 0.05;

            // Beats per second and beat-phase advance
            const beatsPerSec = this.currentBPM / 60;
            this.beatPhase += beatsPerSec * dt;

            // Detect peak R-wave beat flash
            const subPhase = this.beatPhase % 1;
            const isPeakNow = subPhase >= 0.31 && subPhase <= 0.36;

            if (pulseDot) {
                if (isPeakNow) pulseDot.classList.add('flash');
                else pulseDot.classList.remove('flash');
            }

            // Sample raw ECG voltage with physiological micro-noise
            const rawVoltage = ecgSamplePoint(this.beatPhase);
            const noise = (Math.random() - 0.5) * 0.035;
            const voltage = clamp(rawVoltage + noise, -1.2, 1.2);

            // Append new point and shift sliding window
            this.dataPoints.push({ id: this.pointCounter++, voltage });
            if (this.dataPoints.length > this.maxPoints) {
                this.dataPoints.shift();
            }

            // Update D3 line path
            path.attr('d', lineGenerator(this.dataPoints) || '');

            // Update leading head dot position
            const lastPoint = this.dataPoints[this.dataPoints.length - 1];
            if (lastPoint) {
                headDot
                    .attr('cx', width - 2)
                    .attr('cy', yScale(lastPoint.voltage));
            }

            // Live Telemetry Readouts (updated every ~200ms)
            if (bpmReadout && Math.floor(now / 200) !== Math.floor((now - dt * 1000) / 200)) {
                // Subtle physiological jitter ±1 BPM
                const jitter = Math.sin(now / 600) > 0.4 ? 1 : 0;
                const displayBPM = Math.round(this.currentBPM) + jitter;
                bpmReadout.textContent = displayBPM.toString();

                const zone = getHeartRateZone(displayBPM);
                if (zoneBadge) {
                    zoneBadge.textContent = `Zone ${zone.zone}`;
                    zoneBadge.style.backgroundColor = zone.color;
                }
                if (zoneLabel) zoneLabel.textContent = zone.label;
                if (zoneDesc) zoneDesc.textContent = zone.description;

                // Dynamic HRV correlated with zone
                if (hrvVal) {
                    const estimatedHRV = Math.max(32, Math.round(110 - displayBPM * 0.38));
                    hrvVal.textContent = `${estimatedHRV} ms`;
                }
                if (recoveryVal) {
                    const recoveryDrop = Math.round(35 + (180 - displayBPM) * 0.12);
                    recoveryVal.textContent = `+${recoveryDrop} BPM / min`;
                }
            }

            this.animFrameId = requestAnimationFrame(tick);
        };

        this.animFrameId = requestAnimationFrame(tick);
    }

    destroy() {
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
        if (this.container) {
            this.container.querySelectorAll('.btn-zone').forEach((btn) => {
                btn.removeEventListener('click', this.onZoneClick);
            });
        }
    }
}
