// Scrollbar Removal
(function () {
    var s = document.createElement('style');
    s.textContent =
        'html{-ms-overflow-style:none;scrollbar-width:none;overflow-y:scroll;}' +
        'html::-webkit-scrollbar{display:none;width:0;height:0;}';
    document.head.appendChild(s);
}());


// Section Transition and Entrance System
document.addEventListener('DOMContentLoaded', function () {

    var sections = document.querySelectorAll('.section:not(.hero)');
    var nextBtns = document.querySelectorAll('.section__next-btn');

    // Add is-in class to all .anim-write elements within a section,
    // staggering each element's animation delay by 120ms.
    function animateIn(section) {
        var els = section.querySelectorAll('.anim-write');
        els.forEach(function (el, i) {
            el.classList.remove('is-in', 'is-out');
            // Force style recalculation to reset the animation
            void el.offsetWidth;
            el.style.setProperty('--write-delay', (i * 0.12) + 's');
            el.classList.add('is-in');
        });
    }

    // Add is-out class to currently visible .anim-write elements,
    // then call done() after the exit animation completes.
    function animateOut(section, done) {
        var els = section.querySelectorAll('.anim-write.is-in');
        if (!els.length) {
            if (done) done();
            return;
        }
        els.forEach(function (el) {
            el.classList.remove('is-in');
            void el.offsetWidth;
            el.classList.add('is-out');
        });
        setTimeout(done, 480);
    }

    // Remove all animation state so elements reset to hidden default.
    // Called when a section leaves the viewport.
    function resetSection(section) {
        section.querySelectorAll('.anim-write').forEach(function (el) {
            el.classList.remove('is-in', 'is-out');
        });
    }

    // Watch each section. Animate in on enter, reset on exit.
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateIn(entry.target);
            } else {
                resetSection(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    sections.forEach(function (section) {
        observer.observe(section);
    });

    // Next-section button: animate out current section, then scroll.
    nextBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-target');
            var target = document.getElementById(targetId);
            if (!target) return;

            var currentSection = btn.closest('section');

            animateOut(currentSection, function () {
                target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    });

});