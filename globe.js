import Globe from 'https://esm.sh/globe.gl@2';
import * as topojson from 'https://esm.sh/topojson-client@3';

const WORLD_TOPO_URL = 'https://unpkg.com/world-atlas@2/countries-110m.json';

// ── Inject glow-dot CSS once ──
(function injectGlowDotStyles() {
    if (document.getElementById('globe-glow-dot-styles')) return;
    const style = document.createElement('style');
    style.id = 'globe-glow-dot-styles';
    style.textContent = `
        @keyframes glowDotPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
            50% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        @keyframes glowDotBreathe {
            0%, 100% { box-shadow: 0 0 4px 1px rgba(14,165,233,0.6), 0 0 10px 3px rgba(139,92,246,0.3); }
            50% { box-shadow: 0 0 8px 3px rgba(14,165,233,0.9), 0 0 18px 6px rgba(139,92,246,0.5); }
        }
        .globe-glow-dot {
            position: relative;
            width: 10px;
            height: 10px;
        }
        .globe-glow-dot-core {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: radial-gradient(circle, #fff 0%, #0ea5e9 50%, #8b5cf6 100%);
            animation: glowDotBreathe 2s ease-in-out infinite;
        }
        .globe-glow-dot-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 1.5px solid rgba(14, 165, 233, 0.5);
            animation: glowDotPulse 2.5s ease-out infinite;
        }
        .globe-glow-dot-ring-2 {
            animation-delay: 1.25s;
        }

        /* India destination glow dot */
        .globe-glow-dot-india .globe-glow-dot-core {
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #fff 0%, #d946ef 40%, #8b5cf6 100%);
            animation: glowDotBreathe 1.5s ease-in-out infinite;
            box-shadow: 0 0 12px 4px rgba(217, 70, 239, 0.6), 0 0 24px 8px rgba(139, 92, 246, 0.3);
        }
        .globe-glow-dot-india .globe-glow-dot-ring {
            width: 26px;
            height: 26px;
            border-color: rgba(217, 70, 239, 0.5);
            animation: glowDotPulse 2s ease-out infinite;
        }
    `;
    document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', async () => {
    const canvasEl = document.getElementById('cobe-globe-canvas');
    if (!canvasEl) return;

    const container = canvasEl.parentElement;
    // globe.gl creates its own canvas, so replace ours
    container.innerHTML = '';

    const globeDiv = document.createElement('div');
    globeDiv.style.width = '100%';
    globeDiv.style.height = '100%';
    globeDiv.style.cursor = 'grab';
    container.appendChild(globeDiv);

    // ── Load World Data ──
    let countries;
    try {
        const res = await fetch(WORLD_TOPO_URL);
        const worldTopo = await res.json();
        countries = topojson.feature(worldTopo, worldTopo.objects.countries);
    } catch (e) {
        console.error('Failed to load world topology:', e);
        return;
    }

    // India ISO 3166-1 numeric = 356
    const INDIA_ID = '356';
    const indiaFeature = countries.features.find(f => f.id === INDIA_ID);
    const allFeatures = countries.features;

    // ── India coordinates ──
    const india = { lat: 20.5937, lng: 78.9629 };

    // ── Beam origins (world cities) ──
    const origins = [
        { lat: 37.7749, lng: -122.4194, label: 'San Francisco' },
        { lat: 51.5074, lng: -0.1278, label: 'London' },
        { lat: -33.8688, lng: 151.2093, label: 'Sydney' },
        { lat: 35.6762, lng: 139.6503, label: 'Tokyo' },
        { lat: -23.5505, lng: -46.6333, label: 'São Paulo' },
        { lat: 55.7558, lng: 37.6173, label: 'Moscow' },
        { lat: 1.3521, lng: 103.8198, label: 'Singapore' },
        { lat: 25.2048, lng: 55.2708, label: 'Dubai' },
    ];

    // ── Arc data (beams converging on India) ──
    const arcsData = origins.map((o, i) => ({
        startLat: o.lat,
        startLng: o.lng,
        endLat: india.lat,
        endLng: india.lng,
        color: ['#0ea5e9', '#d946ef'], // Gradient mapping matching requested palette
        dashOffset: i * 0.2 // stagger animations
    }));

    // ── Ring markers at India ──
    const ringsData = [
        { lat: india.lat, lng: india.lng, maxR: 5, propagationSpeed: 2, repeatPeriod: 1500 }
    ];

    // ── HTML glow dot elements for origin cities ──
    function createGlowDotElement(isIndia = false) {
        const wrapper = document.createElement('div');
        wrapper.className = 'globe-glow-dot' + (isIndia ? ' globe-glow-dot-india' : '');

        const core = document.createElement('div');
        core.className = 'globe-glow-dot-core';

        const ring1 = document.createElement('div');
        ring1.className = 'globe-glow-dot-ring';

        const ring2 = document.createElement('div');
        ring2.className = 'globe-glow-dot-ring globe-glow-dot-ring-2';

        // Stagger animation for each dot
        const delay = Math.random() * 2;
        core.style.animationDelay = delay + 's';
        ring1.style.animationDelay = delay + 's';
        ring2.style.animationDelay = (delay + 1.25) + 's';

        wrapper.appendChild(core);
        wrapper.appendChild(ring1);
        wrapper.appendChild(ring2);
        return wrapper;
    }

    const htmlElementsData = [
        // Origin city glow dots
        ...origins.map(o => ({
            lat: o.lat,
            lng: o.lng,
            alt: 0.01,
            label: o.label,
            isIndia: false
        })),
        // India destination glow dot
        {
            lat: india.lat,
            lng: india.lng,
            alt: 0.015,
            label: 'India',
            isIndia: true
        }
    ];

    // ── Build Globe ──
    const width = container.offsetWidth;

    const globe = Globe()(globeDiv)
        .width(width)
        .height(width)
        .backgroundColor('rgba(0, 0, 0, 0)')
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor('#334155')
        .atmosphereAltitude(0.2)

        // ── Hex Polygons: glowing white-dot grid for ALL countries ──
        .hexPolygonsData(allFeatures)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.62)
        .hexPolygonUseDots(true)
        .hexPolygonColor(feat => {
            if (feat.id === INDIA_ID) {
                // India dots: bright glowing purple-white
                return 'rgba(220, 200, 255, 1)';
            }
            // All other countries: pure bright white for glow effect
            return 'rgba(255, 255, 255, 1)';
        })
        .hexPolygonAltitude(feat => feat.id === INDIA_ID ? 0.012 : 0.006)

        // ── India outline polygon ──
        .polygonsData(indiaFeature ? [indiaFeature] : [])
        .polygonCapColor(() => 'rgba(139, 92, 246, 0.15)')
        .polygonSideColor(() => 'rgba(139, 92, 246, 0.08)')
        .polygonStrokeColor(() => 'rgba(252, 231, 243, 0.8)')
        .polygonAltitude(() => 0.01)

        // ── Arcs: animated beams ──
        .arcsData(arcsData)
        .arcColor('color')
        .arcDashLength(0.5)
        .arcDashGap(0.3)
        .arcDashAnimateTime(2500)
        .arcStroke(0.6)
        .arcAltitudeAutoScale(0.4)

        // ── Rings: pulsing rings at India ──
        .ringsData(ringsData)
        .ringColor(() => t => `rgba(252, 231, 243, ${1 - t})`)
        .ringMaxRadius('maxR')
        .ringPropagationSpeed('propagationSpeed')
        .ringRepeatPeriod('repeatPeriod')

        // ── HTML Glow Dots: origin cities + India ──
        .htmlElementsData(htmlElementsData)
        .htmlLat('lat')
        .htmlLng('lng')
        .htmlAltitude('alt')
        .htmlElement(d => createGlowDotElement(d.isIndia));

    // ── Set dark globe material ──
    const globeMaterial = globe.globeMaterial();
    globeMaterial.color.set('#080810');
    globeMaterial.emissive.set('#0a0a15');
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0;

    // ── Enhance hex dots with emissive white glow via Three.js ──
    const scene = globe.scene();
    if (scene) {
        const THREE = await import('https://esm.sh/three@0.160');

        // Add scene lights for dot luminance
        const glowLight = new THREE.PointLight('#ffffff', 0.5, 300);
        glowLight.position.set(0, 0, 150);
        scene.add(glowLight);

        const glowLight2 = new THREE.PointLight('#8b5cf6', 0.3, 200);
        glowLight2.position.set(60, 60, 100);
        scene.add(glowLight2);

        // Traverse scene to find hex polygon meshes and add emissive glow
        setTimeout(() => {
            scene.traverse(obj => {
                if (obj.isMesh && obj.material) {
                    const mat = obj.material;
                    // Detect hex polygon dot meshes by their color (white or purple-ish)
                    if (mat.color) {
                        const r = mat.color.r, g = mat.color.g, b = mat.color.b;
                        // White dots (r≈1, g≈1, b≈1) or purple-white dots
                        if (r > 0.7 && g > 0.7 && b > 0.7) {
                            mat.emissive = new THREE.Color('#ffffff');
                            mat.emissiveIntensity = 0.6;
                            mat.transparent = true;
                            mat.opacity = 0.95;
                            mat.needsUpdate = true;
                        }
                        // Purple/India dots
                        else if (r > 0.7 && b > 0.8) {
                            mat.emissive = new THREE.Color('#c4b5fd');
                            mat.emissiveIntensity = 0.8;
                            mat.needsUpdate = true;
                        }
                    }
                }
            });
        }, 2000); // Wait for globe to finish rendering meshes
    }

    // ── Controls ──
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.8;
    globe.controls().enableZoom = false;
    globe.pointOfView({ lat: 20, lng: 78, altitude: 2.0 });

    // ── Handle resize ──
    window.addEventListener('resize', () => {
        if (container) {
            const w = container.offsetWidth;
            globe.width(w).height(w);
        }
    });
});
