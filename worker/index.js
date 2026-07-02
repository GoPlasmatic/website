// Host-canonicalization Worker in front of the static assets.
// goplasmatic.io is the canonical domain; goplasmatic.ai (apex or any
// subdomain) 301s to the same path + query on goplasmatic.io so search
// engines consolidate all ranking signals onto one origin.
//
// The check is an allow-list of alias hosts (not "anything != .io") so
// `wrangler dev` / preview URLs keep serving assets instead of redirecting.
const CANONICAL_HOST = "goplasmatic.io";

function isAliasHost(hostname) {
    return hostname === "goplasmatic.ai" || hostname.endsWith(".goplasmatic.ai");
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        if (isAliasHost(url.hostname)) {
            url.hostname = CANONICAL_HOST;
            url.protocol = "https:";
            url.port = "";
            return Response.redirect(url.toString(), 301);
        }
        return env.ASSETS.fetch(request);
    },
};
