import Link from "next/link";

export default function SharedEstimateNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200">
          <svg
            className="h-10 w-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Presupuesto no encontrado
        </h1>
        <p className="mt-3 text-slate-600">
          Este enlace no es válido o el presupuesto ya no está disponible.
          Contacta con el profesional que te lo envió.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-[#1e3a5f] px-6 py-3 text-sm font-medium text-white hover:bg-[#2c5282] transition-colors"
        >
          Ir a Refolder
        </Link>
      </div>
    </div>
  );
}
