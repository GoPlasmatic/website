// Contact form — submits to Formspree via fetch so the user stays on the
// page. Falls back to a normal form POST if JS is disabled or the fetch
// throws (the <form action> attribute handles that case natively).

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("contactStatus");
    const submit = form.querySelector(".contact-submit");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        status.className = "contact-status";
        status.textContent = "Sending…";
        submit.disabled = true;

        try {
            const res = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: { Accept: "application/json" },
            });
            if (res.ok) {
                form.reset();
                status.className = "contact-status is-success";
                status.textContent = "Thanks — we'll be in touch shortly.";
            } else {
                const data = await res.json().catch(() => ({}));
                const msg = data?.errors?.[0]?.message;
                status.className = "contact-status is-error";
                status.textContent =
                    msg || "Something went wrong. Please try again.";
            }
        } catch {
            status.className = "contact-status is-error";
            status.textContent =
                "Network error. Please try again or email us directly.";
        } finally {
            submit.disabled = false;
        }
    });
});
