import { useEffect } from "react";

// Sets document.title for the current route (the vanilla site had a per-page
// <title>). Restores nothing on unmount — the next page sets its own.
export function usePageTitle(title) {
    useEffect(() => {
        document.title = title;
    }, [title]);
}
