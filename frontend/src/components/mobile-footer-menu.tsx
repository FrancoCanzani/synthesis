import { Home, Inbox, Newspaper, Notebook, Rss, Settings } from "lucide-react";
import { Link } from "react-router";

export default function MobileFooterMenu() {
  return (
    <nav className="z-10 grid w-full grid-cols-6 items-center gap-1.5 border-t bg-background md:hidden">
      <Link
        className="group flex h-11 flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/home"
      >
        <Home />
      </Link>
      <Link
        className="group flex h-11 flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/inbox"
      >
        <Inbox />
      </Link>
      <Link
        className="group flex h-11 flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/articles"
      >
        <Newspaper />
      </Link>
      <Link
        className="group flex h-11 flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/feeds"
      >
        <Rss />
      </Link>
      <Link
        className="group flex h-11 flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/notes"
      >
        <Notebook />
      </Link>
      <Link
        className="group flex h-11 flex-1 items-center justify-center rounded-sm px-3 py-1.5 hover:bg-muted"
        to="/settings"
      >
        <Settings />
      </Link>
    </nav>
  );
}
