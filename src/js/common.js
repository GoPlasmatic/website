// Shared chrome + page-init logic for all Plasmatic pages.
//
// Provides two custom elements:
//   <site-nav active="home|product">
//   <site-footer variant="home|product">
//
// Also auto-injects the scroll-hint, wires the IntersectionObserver for
// reveal animations, primes scroll-snap, and refreshes Lucide icons.

// Identity tagged template — marker for the build's inline-HTML minifier.
const html = (s, ...v) => s.reduce((a, p, i) => a + p + (v[i] ?? ""), "");

const NAV_ITEMS = [
    { label: "Product", href: "product.html", key: "product" },
    { label: "Docs", href: "#" },
    { label: "Contact", href: "contact.html", key: "contact" },
    { label: "GitHub", href: "https://github.com/GoPlasmatic" },
];

const FOOTER_VARIANTS = {
    home: {
        brand: "A software company focused on building infrastructure for modern systems.",
        product: [
            { label: "Orion", href: "product.html" },
            { label: "Documentation", href: "#" },
            { label: "Changelog", href: "#" },
            { label: "GitHub", href: "https://github.com/GoPlasmatic" },
        ],
        company: [
            { label: "Contact", href: "contact.html" },
            { label: "Enquiries", href: "mailto:enquiries@goplasmatic.io" },
        ],
    },
    product: {
        brand: "Building the nervous system for modern software.",
        product: [
            { label: "Features", href: "#" },
            { label: "Documentation", href: "#" },
            { label: "Pricing", href: "#" },
            { label: "Changelog", href: "#" },
        ],
        company: [
            { label: "Contact", href: "contact.html" },
            { label: "GitHub", href: "https://github.com/GoPlasmatic" },
        ],
    },
};

const ext = (href) =>
    /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : "";

const linkList = (items) =>
    items
        .map(
            (i) => `<li><a href="${i.href}"${ext(i.href)}>${i.label}</a></li>`,
        )
        .join("");

class SiteNav extends HTMLElement {
    connectedCallback() {
        const active = this.getAttribute("active") || "";
        const links = NAV_ITEMS.map((i) => {
            const cur = i.key === active ? ' aria-current="page"' : "";
            return `<a href="${i.href}"${cur}${ext(i.href)}>${i.label}</a>`;
        }).join("");

        this.innerHTML = html`
            <nav class="nav">
                <a href="index.html" aria-label="Plasmatic home" class="nav-logo-link">
                    <img
                        src="assets/plasmatic-logo.svg"
                        alt="Plasmatic"
                        class="nav-logo"
                    />
                </a>
                <div class="nav-links">
                    ${links}
                    <button class="btn-nav">Get started</button>
                </div>
            </nav>
        `;
    }
}

class SiteFooter extends HTMLElement {
    connectedCallback() {
        const variant = this.getAttribute("variant") || "home";
        const data = FOOTER_VARIANTS[variant] || FOOTER_VARIANTS.home;

        this.innerHTML = html`
            <footer class="footer section-dimmed">
                <div class="section-container">
                    <div class="footer-grid">
                        <div class="footer-brand">
                            <img
                                src="assets/plasmatic-logo.svg"
                                alt="Plasmatic"
                                class="footer-logo"
                            />
                            <p>${data.brand}</p>
                        </div>
                        <div class="footer-col">
                            <h4>Product</h4>
                            <ul>${linkList(data.product)}</ul>
                        </div>
                        <div class="footer-col">
                            <h4>Company</h4>
                            <ul>${linkList(data.company)}</ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2026 Plasmatic. All rights reserved.</p>
                        <div class="footer-links">
                            <a href="privacy.html">Privacy Policy</a>
                            <a href="terms.html">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define("site-nav", SiteNav);
customElements.define("site-footer", SiteFooter);

// Disable browser scroll restoration so refresh always lands at the top of
// the hero, then enable scroll-snap on the next frame to avoid the initial
// jump that mandatory snap causes during layout.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("load", () => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
        document.documentElement.classList.add("snap-ready");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Inject the scroll-hint badge after the nav so it floats over the hero.
    const hint = document.createElement("div");
    hint.className = "scroll-hint";
    hint.id = "scrollHint";
    hint.innerHTML = `<span>Scroll to explore</span><div class="arrow"></div>`;
    document.body.appendChild(hint);

    addEventListener("scroll", () => {
        hint.classList.toggle("hidden", scrollY > 80);
    });

    // Lucide icons render the <i data-lucide="..."> placeholders. Run after
    // <site-nav> / <site-footer> / page content have all been parsed.
    if (window.lucide) lucide.createIcons();

    // Reveal-on-scroll: fade/slide elements in once they enter the viewport.
    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) entry.target.classList.add("visible");
            }
        },
        { threshold: 0.1 },
    );
    document
        .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-blur")
        .forEach((el) => observer.observe(el));
});
