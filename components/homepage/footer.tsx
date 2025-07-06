export default function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 py-8 border-t">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} SpotMap • Developed by Tavares
          </span>
        </div>
      </div>
    </footer>
  );
}
