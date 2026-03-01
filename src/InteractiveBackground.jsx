import React, { useEffect, useRef } from 'react';

const InteractiveBackground = ({ theme }) => {
    const containerRef = useRef(null);
    const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const prefersReducedMotion = useRef(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    useEffect(() => {
        if (prefersReducedMotion.current) return;

        let idleTimer;
        let isIdle = false;

        const handleMouseMove = (e) => {
            targetPos.current = { x: e.clientX, y: e.clientY };
            isIdle = false;

            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                isIdle = true;
            }, 8000);
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Initial idle timer
        idleTimer = setTimeout(() => {
            isIdle = true;
        }, 8000);

        let animationFrameId;
        const animate = () => {
            if (isIdle) {
                // Subtle slow drift
                const time = Date.now() * 0.0005;
                const driftX = window.innerWidth / 2 + Math.cos(time) * 150;
                const driftY = window.innerHeight / 2 + Math.sin(time * 0.8) * 150;
                targetPos.current = { x: driftX, y: driftY };
            }

            // Heavier, silkier easing (0.04 instead of 0.05)
            mousePos.current.x += (targetPos.current.x - mousePos.current.x) * 0.04;
            mousePos.current.y += (targetPos.current.y - mousePos.current.y) * 0.04;

            if (containerRef.current) {
                containerRef.current.style.setProperty('--mouse-x', `${mousePos.current.x}px`);
                containerRef.current.style.setProperty('--mouse-y', `${mousePos.current.y}px`);

                // Normalized coordinates for parallax (-1 to 1)
                const px = (mousePos.current.x / window.innerWidth) * 2 - 1;
                const py = (mousePos.current.y / window.innerHeight) * 2 - 1;
                // Expose to document root so other components can use it
                document.documentElement.style.setProperty('--px', px.toFixed(3));
                document.documentElement.style.setProperty('--py', py.toFixed(3));
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(idleTimer);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const isDark = theme !== 'light';
    let baseRGB = '185, 28, 28';
    let orbRGB = '153, 27, 27';
    if (theme === 'green-aurora') { baseRGB = '16, 185, 129'; orbRGB = '4, 120, 87'; }
    else if (theme === 'blue-earth') { baseRGB = '59, 130, 246'; orbRGB = '29, 78, 216'; }

    if (prefersReducedMotion.current) {
        return (
            <div style={{
                position: 'fixed',
                inset: 0,
                zIndex: -1,
                pointerEvents: 'none',
                background: isDark ? '#030712' : '#f8fafc'
            }} />
        )
    }

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                pointerEvents: 'none',
                overflow: 'hidden',
                '--mouse-x': '50vw',
                '--mouse-y': '50vh',
                willChange: 'transform' // GPU acceleration hint
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundSize: '24px 24px',
                    backgroundImage: isDark
                        ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)'
                        : 'radial-gradient(circle, rgba(0,0,0,0.06) 1.5px, transparent 1.5px)',
                    maskImage: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 80%)',
                    opacity: 0.8,
                    transition: 'background-image var(--duration-slow) var(--ease-cinematic)',
                    willChange: 'mask-image'
                }}
            />
            {/* Base subtle grid */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-5%', /* Oversize to allow parallax shifting */
                    backgroundSize: '24px 24px',
                    backgroundImage: isDark
                        ? 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)'
                        : 'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
                    transition: 'background-image var(--duration-slow) var(--ease-cinematic)',
                    transform: 'translate3d(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -10px), 0)',
                    willChange: 'transform'
                }}
            />
            {/* Mouse hover glow for nearby dots */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: isDark
                        ? `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(${baseRGB}, 0.12), transparent 40%)`
                        : `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(${baseRGB}, 0.08), transparent 40%)`,
                    opacity: 1,
                    pointerEvents: 'none',
                    willChange: 'background',
                    zIndex: -1
                }}
            />
            {/* Soft glowing orbs in corners */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '60vw',
                    height: '60vw',
                    background: isDark ? `radial-gradient(circle, rgba(${baseRGB}, 0.05) 0%, transparent 60%)` : `radial-gradient(circle, rgba(${baseRGB}, 0.03) 0%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    transition: 'background var(--duration-slow) ease',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-10%',
                    width: '50vw',
                    height: '50vw',
                    background: isDark ? `radial-gradient(circle, rgba(${orbRGB}, 0.05) 0%, transparent 60%)` : `radial-gradient(circle, rgba(${orbRGB}, 0.03) 0%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(100px)',
                    transition: 'background var(--duration-slow) ease',
                }}
            />
        </div>
    );
};

export default InteractiveBackground;
