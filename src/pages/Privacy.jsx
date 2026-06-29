import { usePageMeta } from "../hooks/usePageMeta.js";
import { ROUTES } from "../site-meta.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import legalCss from "../styles/legal.css?inline";

export default function Privacy() {
    usePageMeta(ROUTES["/privacy"]);
    usePageStyles(legalCss);
    return (
        <section className="section-legal" data-test-section="main">
            <div className="legal-container">
                <div className="label-mono legal-meta">
                    Last updated: 28 April 2026
                </div>
                <h1>Privacy Policy</h1>
                <p className="legal-lede">
                    This policy explains how Plasmatic Pte Ltd collects, uses,
                    discloses and protects personal data in accordance with the
                    Personal Data Protection Act 2012 of Singapore (the
                    “PDPA”).
                </p>

                <h2>1. About us</h2>
                <p>
                    Plasmatic Pte Ltd (“Plasmatic”, “we”, “our”, or “us”) is a
                    private limited company incorporated in Singapore with UEN{" "}
                    <strong>[UEN]</strong>, having its registered office at{" "}
                    <strong>[Registered Office Address], Singapore</strong>.
                </p>
                <p>
                    This Privacy Policy applies to personal data we collect
                    through our website at{" "}
                    <a
                        href="https://goplasmatic.io"
                        target="_blank"
                        rel="noopener"
                    >
                        goplasmatic.io
                    </a>{" "}
                    (the “Site”) and any related communications or services.
                </p>

                <h2>2. Personal data we collect</h2>
                <p>
                    We collect personal data that you provide directly to us and
                    information collected automatically as you use the Site.
                </p>
                <h3>Information you provide</h3>
                <ul>
                    <li>
                        Contact details you submit through forms or email (name,
                        email address, company, message contents).
                    </li>
                    <li>
                        Information you provide when corresponding with us about
                        products, partnerships, or employment.
                    </li>
                </ul>
                <h3>Information collected automatically</h3>
                <ul>
                    <li>
                        Technical information about your device and browser (IP
                        address, browser type and version, operating system,
                        referring URL).
                    </li>
                    <li>
                        Usage data such as pages visited, time spent, and
                        interactions on the Site.
                    </li>
                    <li>
                        Information collected through cookies and similar
                        technologies (see Section 9).
                    </li>
                </ul>

                <h2>3. How we use personal data</h2>
                <p>We use personal data for the following purposes:</p>
                <ul>
                    <li>
                        To respond to enquiries, requests for information, and
                        other communications you initiate.
                    </li>
                    <li>
                        To provide, operate, maintain, and improve the Site.
                    </li>
                    <li>
                        To send service-related communications, including
                        product updates, where you have requested them or where
                        we are otherwise permitted under the PDPA.
                    </li>
                    <li>
                        To detect, prevent, and address technical issues and
                        security incidents.
                    </li>
                    <li>
                        To comply with applicable laws, regulatory requirements,
                        and lawful requests from authorities.
                    </li>
                </ul>

                <h2>4. Lawful basis for processing</h2>
                <p>
                    We collect, use, and disclose personal data with your
                    consent, which may be given expressly or deemed under the
                    PDPA. We may also rely on the exceptions set out in the
                    First or Second Schedule to the PDPA where applicable
                    (including legitimate interests, business improvement, and
                    legal obligation).
                </p>

                <h2>5. Disclosure of personal data</h2>
                <p>
                    We do not sell personal data. We may disclose personal data
                    to:
                </p>
                <ul>
                    <li>
                        Service providers who process data on our behalf (for
                        example, hosting, email delivery, analytics, and form
                        processing). These providers are bound by
                        confidentiality and data protection obligations.
                    </li>
                    <li>
                        Professional advisors (legal, accounting, and audit) on
                        a need-to-know basis.
                    </li>
                    <li>
                        Government authorities, regulators, or law enforcement
                        when required by law or to protect our legal rights.
                    </li>
                    <li>
                        A successor entity in connection with a merger,
                        acquisition, or sale of assets, subject to appropriate
                        confidentiality safeguards.
                    </li>
                </ul>

                <h2>6. Cross-border transfer of personal data</h2>
                <p>
                    Some of our service providers are located outside Singapore.
                    Where we transfer personal data overseas, we take steps to
                    ensure that the recipient is bound by legally enforceable
                    obligations to provide a standard of protection comparable
                    to that under the PDPA, in accordance with Section 26 of the
                    PDPA and the Personal Data Protection Regulations 2021.
                </p>

                <h2>7. Retention of personal data</h2>
                <p>
                    We retain personal data only for as long as it is necessary
                    to fulfil the purposes for which it was collected, or as
                    required by applicable laws or for legitimate business
                    purposes. When personal data is no longer needed, we will
                    take reasonable steps to destroy or anonymise it.
                </p>

                <h2>8. Your rights under the PDPA</h2>
                <p>Subject to the PDPA, you have the right to:</p>
                <ul>
                    <li>
                        <strong>Access</strong> the personal data we hold about
                        you and obtain information on how it has been used or
                        disclosed in the past year.
                    </li>
                    <li>
                        <strong>Correct</strong> any error or omission in your
                        personal data.
                    </li>
                    <li>
                        <strong>Withdraw consent</strong> for the collection,
                        use, or disclosure of your personal data, subject to
                        legal or contractual restrictions and reasonable notice.
                    </li>
                </ul>
                <p>
                    To exercise these rights, contact our Data Protection
                    Officer using the details in Section 13. We may charge a
                    reasonable fee for access requests as permitted under the
                    PDPA.
                </p>
                <p>
                    If you are not satisfied with our response, you may lodge a
                    complaint with the Personal Data Protection Commission of
                    Singapore at{" "}
                    <a
                        href="https://www.pdpc.gov.sg"
                        target="_blank"
                        rel="noopener"
                    >
                        www.pdpc.gov.sg
                    </a>
                    .
                </p>

                <h2>9. Cookies and similar technologies</h2>
                <p>
                    The Site uses cookies and similar technologies to operate
                    correctly, remember preferences, and understand how the Site
                    is used. You can manage or disable cookies through your
                    browser settings; doing so may affect functionality.
                </p>

                <h2>10. Security</h2>
                <p>
                    We implement reasonable technical and organisational
                    security arrangements to protect personal data against
                    unauthorised access, collection, use, disclosure, copying,
                    modification, disposal, or similar risks. No method of
                    transmission over the internet is fully secure, and we
                    cannot guarantee absolute security.
                </p>

                <h2>11. Children</h2>
                <p>
                    The Site is not directed at children under the age of 13,
                    and we do not knowingly collect personal data from children.
                    If you believe a child has provided us with personal data,
                    please contact us so we can take appropriate action.
                </p>

                <h2>12. Changes to this policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. The most
                    current version will always be posted on this page, with the
                    “Last updated” date revised accordingly. Material changes
                    will be brought to your attention through reasonable means.
                </p>

                <h2>13. Contact us</h2>
                <p>
                    If you have any questions about this Privacy Policy or wish
                    to exercise your rights under the PDPA, please contact our
                    Data Protection Officer:
                </p>
                <p>
                    <strong>
                        Plasmatic Pte Ltd — Data Protection Officer
                    </strong>
                    <br />
                    Email:{" "}
                    <a href="mailto:dpo@goplasmatic.io">dpo@goplasmatic.io</a>
                    <br />
                    General enquiries:{" "}
                    <a href="mailto:enquiries@goplasmatic.io">
                        enquiries@goplasmatic.io
                    </a>
                    <br />
                    Address: [Registered Office Address], Singapore
                </p>
            </div>
        </section>
    );
}
