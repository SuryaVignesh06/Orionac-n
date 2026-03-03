"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("TypeScript codebase loaded successfully");
document.addEventListener('DOMContentLoaded', () => {
    // ==== 1. HERO TYPING ANIMATION ====
    const heroTextEl = document.getElementById('hero-typing-text');
    const heroCursor = document.getElementById('hero-cursor');
    const heroFullText = "Research, Engineered\nfor Impact.";
    const typeHeroText = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!heroTextEl)
            return;
        heroTextEl.textContent = '';
        // Wait a beat before starting
        yield new Promise(r => setTimeout(r, 500));
        for (let i = 0; i < heroFullText.length; i++) {
            if (heroFullText.charAt(i) === '\n') {
                heroTextEl.innerHTML += '<br>';
            }
            else {
                heroTextEl.innerHTML += heroFullText.charAt(i);
            }
            // slight random variance for realistic typing
            const speed = 40 + Math.random() * 40;
            yield new Promise(r => setTimeout(r, speed));
        }
        // Optionally hide cursor after done, or keep blinking
        // if (heroCursor) heroCursor.style.display = 'none';
    });
    typeHeroText();
    // ==== 2. SCROLL REVEAL (BOTTOM TO TOP) ====
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits the bottom
    });
    revealElements.forEach(el => revealObserver.observe(el));
    // ==== 3. BRONN ANIMATION SEQUENCE ====
    const visualSection = document.getElementById('bronn-visual-section');
    const floatInputBox = document.getElementById('bronn-floating-input');
    const floatInput = document.getElementById('bronn-floating-auto-input');
    const floatSubmitBtn = document.getElementById('bronn-floating-submit');
    const macbookWindow = document.getElementById('bronn-macbook-window');
    // Internal macbook elements
    const inputEl = document.getElementById('bronn-auto-input');
    const inputContainer = document.getElementById('cinematic-input');
    const overlay = document.getElementById('cinematic-overlay');
    const submitBtn = document.getElementById('bronn-auto-submit');
    const initialState = document.getElementById('bronn-initial-state');
    const analyzingLoader = document.getElementById('bronn-analyzing-loader');
    const resultsView2 = document.getElementById('bronn-results-view-2');
    const bronnFooter = document.getElementById('bronn-footer');
    if (!visualSection || !floatInputBox || !floatInput || !macbookWindow || !initialState || !analyzingLoader || !overlay || !inputContainer)
        return;
    let bronnHasTriggered = false;
    const typeText = (text_1, element_1, ...args_1) => __awaiter(void 0, [text_1, element_1, ...args_1], void 0, function* (text, element, speed = 40) {
        element.value = '';
        for (let i = 0; i < text.length; i++) {
            element.value += text.charAt(i);
            yield new Promise(r => setTimeout(r, speed));
        }
    });
    const runBronnSequence = () => __awaiter(void 0, void 0, void 0, function* () {
        if (bronnHasTriggered)
            return;
        bronnHasTriggered = true;
        while (true) {
            // ==== RESET STATES FOR LOOP ====
            floatInputBox.style.transition = 'none';
            floatInputBox.style.opacity = '0';
            floatInputBox.style.top = '50%';
            floatInputBox.style.transform = 'translate(-50%, -50%) scale(1.05)';
            floatInputBox.style.pointerEvents = 'none';
            floatInput.value = '';
            macbookWindow.style.opacity = '0';
            macbookWindow.classList.remove('animate-in');
            inputEl.value = 'Analyze competitor performance and synthesize market trends for Q3';
            analyzingLoader.classList.add('hidden');
            if (resultsView2) {
                resultsView2.classList.add('hidden');
                resultsView2.style.opacity = '0';
            }
            if (bronnFooter) {
                bronnFooter.style.transition = 'none';
                bronnFooter.style.opacity = '0';
            }
            initialState.classList.remove('hidden');
            // Add a small delay between loops
            yield new Promise(r => setTimeout(r, 1000));
            // ==== PART 1: FLOATING INPUT TYPES PROMPT ====
            // 1. Show floating input smoothly
            floatInputBox.style.transition = 'opacity 0.8s ease, top 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
            yield new Promise(r => setTimeout(r, 50)); // let browser paint
            floatInputBox.style.opacity = '1';
            // 2. Type text in floating input
            yield new Promise(r => setTimeout(r, 600));
            const promptText = "Analyze competitor performance and synthesize market trends for Q3";
            yield typeText(promptText, floatInput);
            // 3. Briefly press floating button
            yield new Promise(r => setTimeout(r, 500));
            if (floatSubmitBtn) {
                floatSubmitBtn.style.transform = 'scale(0.9)';
                floatSubmitBtn.style.backgroundColor = '#a85838';
                setTimeout(() => {
                    floatSubmitBtn.style.transform = 'scale(1)';
                    floatSubmitBtn.style.backgroundColor = '';
                }, 150);
            }
            // ==== PART 2: ANIMATE DOWN & MACBOOK REVEAL ====
            // 4. Animate floating box down directly into the macbook input position
            yield new Promise(r => setTimeout(r, 200));
            floatInputBox.style.transition = 'opacity 0.8s ease, top 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            floatInputBox.style.top = '88%';
            floatInputBox.style.transform = 'translate(-50%, -50%) scale(0.95)';
            // Wait until movement is nearly finished, then trigger the "growth"
            yield new Promise(r => setTimeout(r, 700));
            // 5. Seamless Transition: Macbook grows vertically directly out of the input box
            macbookWindow.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
            macbookWindow.style.opacity = '1';
            macbookWindow.style.transform = 'scaleY(1) translateY(0)';
            // The floating box stays visible as the mockup settles (Persistent Input)
            yield new Promise(r => setTimeout(r, 400));
            // floatInputBox.style.opacity = '0'; // REMOVED: keep visible for analysis phase
            // Wait for growth to finish
            yield new Promise(r => setTimeout(r, 800));
            // Show loader inside macbook immediately
            initialState.classList.add('hidden');
            analyzingLoader.classList.remove('hidden');
            analyzingLoader.classList.add('state-fade-in');
            // 6. Multi-stage loading simulation (adjusted timing for flow)
            const loaderText = analyzingLoader.querySelector('p');
            if (loaderText) {
                yield new Promise(r => setTimeout(r, 1000));
                loaderText.textContent = "Loading data models...";
                yield new Promise(r => setTimeout(r, 1200));
                loaderText.textContent = "Synthesizing intelligence...";
                yield new Promise(r => setTimeout(r, 1200));
            }
            else {
                yield new Promise(r => setTimeout(r, 3400));
            }
            // 7. Hide loader, show Result Dashboard (Synchronized Organic Reveal)
            analyzingLoader.classList.add('hidden');
            if (resultsView2) {
                resultsView2.classList.remove('hidden');
                // Content slide-up reveal
                resultsView2.style.opacity = '0';
                resultsView2.style.transform = 'translateY(20px)';
                resultsView2.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                // Synchronize: Fade out persistent input, fade in mockup footer
                if (bronnFooter) {
                    bronnFooter.style.transition = 'opacity 0.8s ease';
                    bronnFooter.style.opacity = '1';
                }
                floatInputBox.style.transition = 'opacity 0.6s ease';
                floatInputBox.style.opacity = '0';
                // Trigger reflow
                void resultsView2.offsetWidth;
                resultsView2.style.opacity = '1';
                resultsView2.style.transform = 'translateY(0)';
            }
            // ==== PART 3: PAUSE AND RESET ====
            // Wait for user to read the dashboard (longer since it's bigger)
            yield new Promise(r => setTimeout(r, 8000));
            // Reset macbook window to prepare for loop
            macbookWindow.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            macbookWindow.style.opacity = '0';
            macbookWindow.style.transform = 'scaleY(0.1) translateY(20px)';
            yield new Promise(r => setTimeout(r, 800));
        }
    });
    // Trigger Bronn sequence when visual section is halfway visible
    const bronnObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            runBronnSequence();
            bronnObserver.disconnect();
        }
    }, { threshold: 0.2 });
    bronnObserver.observe(visualSection);
    // --- Phase 6: About Section Parallax ---
    const initParallax = () => {
        const container = document.querySelector('.parallax-container');
        const contentLayer = document.getElementById('parallax-content');
        if (!container || !contentLayer)
            return;
        // Content moves up a bit faster
        gsap.to(contentLayer, {
            yPercent: -20,
            ease: "none",
            scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    };
    initParallax();
});
