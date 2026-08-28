import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    CircleSlash,
    Split,
    Unlock,
    Wrench,
    X,
} from "lucide-react";
import SectionGraphic from "../components/SectionGraphic.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useJsonLd } from "../hooks/useJsonLd.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import {
    DOCS_COMPARISON_URL,
    DOCS_INSTALL_URL,
    GITHUB_ORG_URL,
    ROUTES,
} from "../site-meta.js";
import logoSvg from "../assets/logo.svg";
import aboutCss from "../styles/about.css?inline";

// Copy is final per the About page spec, with one build rule carried into the
// markup: no em dashes anywhere in the rendered page.

// The strip's job is the count, not the names, so they render as plain small
// type with a single link out to the org rather than one link each.
const REPOS = ["Orion", "dataflow-rs", "datalogic-rs"];

// Order is fixed by the spec: Muthu, Harishankar, Vinay. Do not reorder.
// `bio` is an array of paragraphs. Portraits are served from public/team/ (not
// bundled from src/assets) so their URLs stay stable and the Person nodes in
// the structured data can point at the same files. The institution names in Harishankar's bio
// are his previous employers' clients, not Plasmatic customers; the sentence
// construction is what keeps that claim accurate, so they must stay in prose
// and never be lifted into a logo strip or a "trusted by" band.
const TEAM = [
    {
        id: "muthu",
        name: "AKM Muthaalagan",
        photo: "/team/akmmuthu.jpg",
        role: "Founder and CEO",
        tint: "icon-teal",
        linkedin: "https://www.linkedin.com/in/akmmuthu/",
        // As with Harishankar's, the institution names here are not Plasmatic
        // customers. "Directly or indirectly" is load-bearing and so is
        // "including": keep both, and never lift the names into a logo strip
        // or a "trusted by" band.
        bio: [
            "Muthu runs Plasmatic and leads the commercial engagements. His argument for the business is that enterprises should be able to innovate at AI speed without giving up governance, resilience or control.",
            "He has spent nearly three decades in banking, fintech, data and enterprise technology, most of it in senior roles inside Singapore's major banks. He has worked directly or indirectly with leading institutions in Singapore and the region, including DBS, UOB, OCBC, Standard Chartered, Maybank and Tonik Bank, supporting major digital transformation journeys.",
            "An entrepreneur who came up inside banks, he pairs institutional discipline with startup pace, so a complex enterprise problem ends up as a platform an institution can trust and run at scale.",
        ],
    },
    {
        id: "harishankar",
        name: "Harishankar Narayanan",
        photo: "/team/harishankar.jpg",
        role: "Founder, Engineering and Technology Strategy",
        tint: "icon-blue",
        linkedin: "https://www.linkedin.com/in/code42tiger/",
        bio: [
            "Harishankar leads engineering at Plasmatic, building the distributed architecture underneath Orion.",
            "He has spent over 21 years designing low-latency systems and scaling engineering organizations from the ground up. Most recently, as Senior Director at Global Payments, he led enterprise payment engineering teams in India of more than 300 developers, working through the Worldpay, FIS and Global Payments transformations, on platforms used by Netflix, Amazon and Booking.com. Before that, as Senior Director at Volante Technologies, he architected core payment engines for institutions including Citi, BNY, Wells Fargo and Goldman Sachs.",
            "Earlier in his career he founded Smackall Games Pvt Ltd, shipping over 120 apps including several iTunes chart-toppers, and led core engineering transformation at CaratLane.",
        ],
    },
    {
        id: "vinay",
        name: "Vinay Raja",
        photo: "/team/vinay.jpg",
        role: "Founder, Product and Experience",
        tint: "icon-yellow",
        linkedin: "https://www.linkedin.com/in/vinayraja/",
        bio: [
            "Vinay leads product and experience at Plasmatic. His job is the distance between what the platform does and what a developer or a buyer understands it to do: the documentation, the interfaces, the positioning, and the decision about which capability gets explained first. In infrastructure that is a product question before it is a marketing one. A platform nobody can form a clear picture of does not get adopted, whatever it benchmarks at.",
            "He has spent fifteen years on that problem in other categories. Most recently seven years as Creative and Digital Experience Director at AVJennings, where he built and led an in-house creative and digital function across Australia and New Zealand covering brand, UX and content, and set the design standards and ways of working that let the team deliver at scale. Before that he ran creative services across Asia Pacific for PageGroup, from Singapore and Sydney. He also runs Tydal Agency, a strategic design consultancy in Sydney.",
            "Vinay holds a Postgraduate Diploma in Innovation and Design Thinking from MIT and a Master of Design from Swinburne.",
        ],
    },
];

// lucide-react v1 dropped its brand glyphs, so the LinkedIn mark is inlined the
// same way Home.jsx inlines the GitHub mark.
function LinkedinMark() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
        </svg>
    );
}

export default function About() {
    // The bio opens in a native <dialog> so the browser supplies the focus
    // trap, Escape to dismiss, the top layer and focus return to the button
    // that opened it. showModal() runs from an effect rather than the click
    // handler so the content is rendered before the dialog is shown.
    const bioDialog = useRef(null);
    const [openBio, setOpenBio] = useState(null);

    useEffect(() => {
        if (openBio) bioDialog.current?.showModal();
        document.body.classList.toggle("bio-open", !!openBio);
        return () => document.body.classList.remove("bio-open");
    }, [openBio]);

    usePageMeta(ROUTES["/about"]);
    useJsonLd(ROUTES["/about"].jsonLd);
    usePageStyles(aboutCss);

    return (
        <>
            {/* HERO */}
            <section className="hero about-hero" data-test-section="hero">
                <SectionGraphic
                    svg={logoSvg}
                    position="background"
                    colorSource="svg"
                    lineMode="outline"
                    numLines={120}
                    extrudeDepth={1.0}
                    objectOffset="6.5,0"
                    rotation="0,0,0"
                    tilt="10,6,0.05"
                    parallax="0.5,0.2,0.05"
                />
                <div className="section-container">
                    <div className="grid-2col">
                        <div className="reveal-left">
                            <div className="eyebrow">
                                <span>About Plasmatic</span>
                            </div>
                            <h1 className="reveal-blur">
                                We build{" "}
                                <span className="gradient-text">Orion.</span>
                            </h1>
                            <p className="lead about-hero-lead">
                                Plasmatic is three people in three countries
                                building runtimes that let business logic change
                                without shipping a service. Orion is the one you
                                can run today.
                            </p>
                            <div className="hero-ctas">
                                <Link to="/orion" className="btn-primary">
                                    See what Orion does{" "}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                        <div></div>
                    </div>
                    {/* Full width of the container rather than the hero
                        column, so the row of names stays on one line. */}
                    <div className="repo-strip reveal">
                        <ul className="repo-list label-mono">
                            {REPOS.map((repo) => (
                                <li key={repo}>{repo}</li>
                            ))}
                        </ul>
                        <p className="repo-note">
                            <span>All Apache 2.0. All public.</span>
                            <a
                                href={GITHUB_ORG_URL}
                                target="_blank"
                                rel="noopener"
                                className="link-action"
                            >
                                See the source <ArrowRight aria-hidden="true" />
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            {/* WHY WE STARTED
                NOTE: this section's copy is a plausible founding account
                inferred from the team's history, not something a founder has
                said. It is marked UNVERIFIED in the copy spec and must be
                reviewed and corrected by Muthu or Harishankar. */}
            <section
                className="section-full"
                data-test-section="why-we-started"
            >
                <div className="section-container">
                    <div className="story-grid">
                        <div className="col-content reveal-left">
                            <div className="eyebrow">
                                <span>Origin</span>
                            </div>
                            <h2 className="reveal-blur">Why we started</h2>
                        </div>
                        <div className="story-body reveal-right">
                            <p className="section-body">
                                Between us we spent decades building systems
                                that move messages between institutions.
                                Different companies, different decades, the same
                                pattern underneath.
                            </p>
                            <p className="section-body">
                                A lot of what gets called a service is not doing
                                computation. It parses a message, checks it
                                against rules somebody wrote down, enriches it
                                from another system, transforms it and sends it
                                on. Necessary work, and not where anyone's
                                advantage lies. That was tolerable when the
                                rules moved slowly. They no longer do. Pricing,
                                routing, thresholds and compliance logic all
                                change faster than a release cycle can carry
                                them, so changing a number means shipping a
                                service.
                            </p>
                            <p className="section-body">
                                Then generation got cheap, and the gap widened
                                rather than closed. A team can now produce more
                                services than it can review. The constraint
                                moved from writing the thing to trusting it.
                            </p>
                            <div className="callout">
                                <p>
                                    Plasmatic exists to separate the two.{" "}
                                    <strong>
                                        The rule is a document you can read,
                                        version, test and roll back. The runtime
                                        is something you install once, and it is
                                        where the guarantees live.
                                    </strong>
                                </p>
                            </div>
                            <p className="section-body">
                                We built the first version for payment
                                messaging, because that is the version of this
                                problem with the least tolerance for being
                                wrong, and because it is the world we came from.
                                It is not a payments product. Payments is where
                                the requirements were hardest.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE BUSINESS MODEL */}
            <section
                className="section-full"
                data-test-section="business-model"
            >
                <div className="section-container">
                    <div className="section-header reveal">
                        <h2 className="reveal-blur">
                            The software is free.{" "}
                            <span className="gradient-text">
                              Our expertise is the service.
                            </span>
                        </h2>
                        <p>
                            Worth being direct about this, because it determines
                            how we behave and it is not going to change.
                        </p>
                    </div>
                    <div className="grid-2x2">
                        <div className="card card-elevated card-hoverable capability-card model-card reveal">
                            <div className="icon-box icon-teal">
                                <Unlock />
                            </div>
                            <h3>The platform is free and open, permanently.</h3>
                            <p>
                                Apache 2.0, self-hosted, no open-core edition,
                                no paid tier holding the useful features. If
                                Plasmatic disappeared tomorrow your Orion
                                instance keeps running, your workflows are JSON
                                you can read, and the source is public.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card model-card reveal">
                            <div className="icon-box icon-blue">
                                <Wrench />
                            </div>
                            <h3>Bring us in when you need professional expertise.</h3>
                            <p>
                                Deployment into your environment, connectors to
                                the systems Orion does not cover, and production
                                hardening: observability, recovery paths, a
                                runbook your team can operate.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card model-card reveal">
                            <div className="icon-box icon-yellow">
                                <Split />
                            </div>
                            <h3>Where the line sits.</h3>
                            <p>
                                Common, repeatable patterns ship into the open
                                source repositories where everyone gets them.
                                Work specific to your systems is what we charge
                                for. If something you need looks like it belongs
                                in the first category, tell us and it usually
                                ends up there.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card model-card reveal">
                            <div className="icon-box icon-red">
                                <CircleSlash />
                            </div>
                            <h3>We turn work down.</h3>
                            <p>
                                If a piece of work is a genuine one-off with no
                                reuse, we will say so and point you elsewhere.
                                That is not modesty, it is the only way a team
                                this size delivers anything properly.
                            </p>
                        </div>
                    </div>
                    <div className="model-cta reveal">
                        <Link to="/contact" className="btn-primary">
                            Tell us which system{" "}
                            <ArrowRight aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* BUYING FROM US */}
            <section className="section-full" data-test-section="buying">
                <div className="section-container">
                    <div className="stance-grid">
                        <div className="col-content reveal-left">
                            <h2 className="reveal-blur">
                                Founded by three people in{" "}
                                <span className="gradient-text">
                                    three countries
                                </span>
                            </h2>
                            <p className="section-body">
                                Plasmatic is registered in Singapore. We work
                                from India, Singapore and Australia, and we have
                                never all been in the same room. That is a set
                                of facts that should be doing real work in your
                                assessment, so here is how we think it should.
                            </p>
                            <p className="stance-test">
                                The test we hold ourselves to is whether you
                                still need us in month three.
                            </p>
                            <div className="stance-cta">
                                <Link to="/contact" className="link-action">
                                    Ask us something where the honest answer is
                                    bad for us <ArrowRight aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                        <div className="stance-list">
                            <div className="stance-block stance-risk reveal">
                                <p>
                                    <strong>The risks, plainly.</strong>{" "}
                                    Capacity is limited. If two engagements land
                                    in the same month, one waits. We are inside
                                    the working day for most of Asia Pacific,
                                    but we are not a 24 hour rotation and we
                                    will not pretend to be. Three people carry
                                    continuity risk a large vendor does not.
                                </p>
                            </div>
                            <div className="stance-block stance-structure reveal">
                                <p>
                                    <strong>
                                        Some of that is answered by structure
                                        rather than by a promise.
                                    </strong>{" "}
                                    The platform being Apache 2.0 and
                                    self-hosted is the exit path, and it is the
                                    same exit path whether you like us or not.
                                </p>
                            </div>
                            <div className="stance-block stance-small reveal">
                                <p>
                                    <strong>
                                        Some of it is genuinely better small.
                                    </strong>{" "}
                                    The people who build the platform are the
                                    people who do the deployment. There is no
                                    handoff from sales to delivery, because
                                    there is no sales team. When we say a
                                    connector is a week, that is an engineer's
                                    estimate rather than a proposal. And almost
                                    all of our work happens in writing, in
                                    public repositories, which began as a
                                    necessity of the time zones and turned out
                                    to suit an open source project rather well.
                                </p>
                            </div>
                            <div className="stance-block stance-ask reveal">
                                <p>
                                    <strong>What to ask us for.</strong> A named
                                    scope with a defined end. A handover that
                                    includes a runbook. A straight answer on
                                    whether the thing you want is something we
                                    have built before, because the second time
                                    is much faster and you should know which one
                                    you are getting. And ask us what Orion is
                                    not for.{" "}
                                    <a
                                        href={DOCS_COMPARISON_URL}
                                        target="_blank"
                                        rel="noopener"
                                        className="link"
                                    >
                                        Our documentation already answers that
                                    </a>{" "}
                                    and it names Temporal, Kong and Drools.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE TEAM */}
            <section className="section-full" data-test-section="team">
                <div className="section-container">
                    <div className="section-header reveal">
                        <h2 className="reveal-blur">The team</h2>
                    </div>
                    <div className="grid-3col team-grid">
                        {TEAM.map((person) => (
                            <article
                                key={person.id}
                                id={person.id}
                                className="card card-elevated card-hoverable team-card reveal"
                            >
                                <div className={`team-photo ${person.tint}`}>
                                    <img
                                        src={person.photo}
                                        alt={`Portrait of ${person.name}`}
                                        width="128"
                                        height="128"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>
                                <h3 className="team-name">{person.name}</h3>
                                <p className="capability-subtitle">
                                    {person.role}
                                </p>
                                <div className="team-actions">
                                    <a
                                        href={person.linkedin}
                                        target="_blank"
                                        rel="noopener"
                                        className="team-link"
                                        aria-label={`LinkedIn profile for ${person.name}`}
                                    >
                                        <LinkedinMark />
                                        <span>LinkedIn</span>
                                    </a>
                                    <button
                                        type="button"
                                        className="team-bio-btn"
                                        aria-haspopup="dialog"
                                        onClick={() => setOpenBio(person)}
                                    >
                                        <span>Read bio</span>
                                        <ArrowRight aria-hidden="true" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* All three biographies live in the DOM at all times.
                        A closed <dialog> is display:none, so the prose is still
                        in the HTML source for crawlers and text extractors that
                        never fire a click; only the active panel is revealed.
                        Do not go back to rendering one panel on demand: these
                        bios are the page's strongest credibility content and
                        conditional rendering makes them invisible off-page. */}
                    <dialog
                        ref={bioDialog}
                        className="bio-dialog"
                        aria-labelledby={
                            openBio ? `bio-name-${openBio.id}` : undefined
                        }
                        onClose={() => setOpenBio(null)}
                        onClick={(e) => {
                            // A click on the backdrop targets the dialog itself.
                            if (e.target === bioDialog.current)
                                bioDialog.current.close();
                        }}
                    >
                        {TEAM.map((person) => (
                            <div
                                key={person.id}
                                className="bio-dialog-inner"
                                hidden={openBio?.id !== person.id}
                            >
                                <button
                                    type="button"
                                    className="bio-dialog-close"
                                    aria-label="Close biography"
                                    onClick={() => bioDialog.current?.close()}
                                >
                                    <X aria-hidden="true" />
                                </button>
                                <div className="bio-dialog-head">
                                    <div
                                        className={`team-photo ${person.tint}`}
                                    >
                                        <img
                                            src={person.photo}
                                            alt=""
                                            width="128"
                                            height="128"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div>
                                        <h3
                                            id={`bio-name-${person.id}`}
                                            className="team-name"
                                        >
                                            {person.name}
                                        </h3>
                                        <p className="capability-subtitle">
                                            {person.role}
                                        </p>
                                        <a
                                            href={person.linkedin}
                                            target="_blank"
                                            rel="noopener"
                                            className="team-link"
                                            aria-label={`LinkedIn profile for ${person.name}`}
                                        >
                                            <LinkedinMark />
                                            <span>LinkedIn</span>
                                        </a>
                                    </div>
                                </div>
                                <div className="bio-dialog-body">
                                    {person.bio.map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </dialog>
                </div>
            </section>

            {/* CLOSE */}
            <section className="section-cta about-cta" data-test-section="cta">
                <SectionGraphic
                    svg={logoSvg}
                    position="background"
                    colorSource="svg"
                    lineMode="outline"
                    numLines={160}
                    extrudeDepth={1.2}
                    objectOffset="5.5,0"
                    rotation="0,0,0"
                    tilt="12,8,0.06"
                    parallax="0.6,0.25,0.06"
                />
                <div className="section-container">
                    <div className="grid-2col">
                        <div className="cta-inner reveal-left">
                            <div className="eyebrow">
                                <span>Work with us</span>
                            </div>
                            <h2 className="reveal-blur">
                                The platform is yours.{" "}
                                <span className="gradient-text">
                                    The delivery is what we do.
                                </span>
                            </h2>
                            <p className="about-cta-desc">
                                If you are evaluating Orion, start with the
                                quickstart. It takes under a minute and does not
                                require talking to us.
                            </p>
                            <p className="about-cta-desc">
                                If there is a system you cannot see how to
                                connect, or you want this live with a recovery
                                path your team can operate at 3am, that is the
                                conversation. Tell us which system and we will
                                tell you straight whether it is a week or a
                                quarter.
                            </p>
                            <div className="cta-buttons">
                                <Link to="/contact" className="btn-primary">
                                    Tell us which system{" "}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                                <a
                                    href={DOCS_INSTALL_URL}
                                    target="_blank"
                                    rel="noopener"
                                    className="btn-secondary"
                                >
                                    Run the quickstart
                                </a>
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>
            </section>
        </>
    );
}
