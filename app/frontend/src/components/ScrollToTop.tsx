import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Restores scroll position on client-side navigation.
 *
 * React Router keeps the previous scroll offset when only the route changes,
 * so following a footer link from the bottom of a long page would land the
 * user in the middle of the new page and look broken. This resets to the top,
 * and smoothly scrolls to the target section when the URL carries a hash.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Let the destination render before looking for the anchor.
      const id = hash.slice(1);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, left: 0 });
        }
      }, 80);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, hash]);

  return null;
}