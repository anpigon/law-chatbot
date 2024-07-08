import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <span className="inline-block font-bold">법원판례 챗봅서비스</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/"
          className={cn(
            "flex items-center text-sm font-medium text-muted-foreground",
            "cursor-not-allowed opacity-80"
          )}
        >
          {/* Home */}
        </Link>
      </nav>
    </div>
  );
}
