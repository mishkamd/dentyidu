import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <h2 className="text-xl font-semibold text-foreground">Pagina nu a fost găsită</h2>
        <p className="text-muted-foreground max-w-md">
          Pagina pe care o căutați nu există sau a fost mutată.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Înapoi la pagina principală
        </Link>
      </div>
    </div>
  )
}
