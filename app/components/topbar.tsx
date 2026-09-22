export function Topbar() {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">
          Buen dia, Cliente
        </h1>
        <p className="text-sm text-gray-500">
          Bienvenido de nuevo, ¡qué gusto verte otra vez!
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
      </div>
    </header>
  )
}
