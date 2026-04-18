import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-brand-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Fin<span className="text-brand-accent">Lit</span>
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-brand-accent transition-colors">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-brand-accent transition-colors">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
