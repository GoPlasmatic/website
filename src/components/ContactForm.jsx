import { useState } from "react";

// Port of contact.js: submits to Formspree via fetch so the user stays on the
// page, with status messaging. The <form action>/method are kept so a no-JS
// submit still posts natively.
export default function ContactForm() {
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState({ kind: "", message: "" });

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        setSending(true);
        setStatus({ kind: "", message: "Sending…" });

        try {
            const res = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
            });
            if (res.ok) {
                form.reset();
                setStatus({
                    kind: "is-success",
                    message: "Thanks — we'll be in touch shortly.",
                });
            } else {
                const data = await res.json().catch(() => ({}));
                const msg = data?.errors?.[0]?.message;
                setStatus({
                    kind: "is-error",
                    message: msg || "Something went wrong. Please try again.",
                });
            }
        } catch {
            setStatus({
                kind: "is-error",
                message:
                    "Network error. Please try again or email us directly.",
            });
        } finally {
            setSending(false);
        }
    }

    return (
        <form
            id="contactForm"
            className="card card-elevated contact-form"
            action="https://formspree.io/f/movnyqor"
            method="POST"
            onSubmit={handleSubmit}
        >
            <div className="form-row">
                <label htmlFor="contact-name">Name</label>
                <input
                    type="text"
                    id="contact-name"
                    name="name"
                    required
                    autoComplete="name"
                />
            </div>
            <div className="form-row">
                <label htmlFor="contact-email">Email</label>
                <input
                    type="email"
                    id="contact-email"
                    name="email"
                    required
                    autoComplete="email"
                />
            </div>
            <div className="form-row">
                <label htmlFor="contact-company">Company</label>
                <input
                    type="text"
                    id="contact-company"
                    name="company"
                    autoComplete="organization"
                />
            </div>
            <div className="form-row">
                <label htmlFor="contact-message">Message</label>
                <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    required
                ></textarea>
            </div>
            <button
                type="submit"
                className="btn-primary contact-submit"
                disabled={sending}
            >
                Send message &rarr;
            </button>
            <p
                className={`contact-status ${status.kind}`.trim()}
                id="contactStatus"
                role="status"
                aria-live="polite"
            >
                {status.message}
            </p>
        </form>
    );
}
