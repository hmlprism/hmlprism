"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";

/** Thin, dismissible promo bar shown above the header. */
export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative bg-navy-900 text-navy-100">
      <div className="container flex items-center justify-center gap-3 py-2 text-center text-xs sm:text-sm">
        <p>
          Start your digital journey now —{" "}
          <Link
            href="/contact"
            className="font-semibold text-accent underline-offset-2 hover:underline"
          >
            book a free consultation
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-navy-100 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
