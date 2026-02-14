import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600 dark:text-gray-400">Página no encontrada</p>
      <Link href="/" className="text-blue-600 hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
