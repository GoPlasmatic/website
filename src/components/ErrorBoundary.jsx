import { Component } from "react";

// Catches render-time errors in the routed page subtree so a single thrown
// component degrades to an on-brand message instead of white-screening the whole
// SPA. Layout keys this by pathname, so navigating away clears the error.
export default class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Surface for debugging; a real logger would hook in here.
        console.error("[ErrorBoundary] unhandled UI error:", error, info);
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            this.props.fallback ?? (
                <div className="error-fallback" role="alert">
                    <h1>Something went wrong.</h1>
                    <p>
                        An unexpected error stopped this page from rendering. Try
                        reloading — if it keeps happening, let us know.
                    </p>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Reload page
                    </button>
                </div>
            )
        );
    }
}
