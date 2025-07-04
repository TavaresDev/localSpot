import Link from "next/link";

const links = [
  {
    title: "Safety Guidelines",
    href: "/safety",
  },
  {
    title: "Community Rules",
    href: "/community-guidelines",
  },
  {
    title: "Spot Submission",
    href: "/spots/create",
  },
  {
    title: "Download App",
    href: "/download",
  },
  {
    title: "Contact",
    href: "/contact",
  },
  {
    title: "Privacy",
    href: "/privacy-policy",
  },
  {
    title: "Terms",
    href: "/terms-of-service",
  },
];

export default function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 py-12 border-t">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="order-last flex items-center gap-3 md:order-first">
            <span className="text-muted-foreground block text-center text-sm">
              © {new Date().getFullYear()} SpotMap, Built by riders for riders
            </span>
          </div>

          <div className="order-first flex flex-wrap gap-x-6 gap-y-4 md:order-last">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground hover:text-primary block duration-150"
              >
                <span>{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
