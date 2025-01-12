import { Home, Inbox, Newspaper, Notebook, Rss, Settings } from "lucide-react";
import { Link } from "react-router";

export default function MobileFooterMenu() {
  return (
    <nav className="z-10 grid grid-cols-6 items-center gap-1.5 border-t bg-background p-1.5 md:hidden">
      <Link
        className="callout-none group flex flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/home"
      >
        <div className="relative">
          <Home />
        </div>
      </Link>
      <Link
        className="callout-none group flex flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/inbox"
      >
        <div className="relative">
          <Inbox />
        </div>
      </Link>
      <Link
        className="callout-none group flex flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/articles"
      >
        <div className="relative">
          <Newspaper />
        </div>
      </Link>
      <Link
        className="callout-none group flex flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/feeds"
      >
        <div className="relative">
          <Rss />
        </div>
      </Link>
      <Link
        className="callout-none group flex flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/notes"
      >
        <div className="relative">
          <Notebook />
        </div>
      </Link>
      <Link
        className="callout-none group flex flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/settings"
      >
        <div className="relative">
          <Settings />
        </div>
      </Link>
    </nav>
  );
}
