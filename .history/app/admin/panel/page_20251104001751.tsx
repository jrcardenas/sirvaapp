return (
  <main className="min-h-screen bg-background p-5 pt-24 max-w-lg mx-auto relative">

    {/* ✅ Banner de llamada de mesas */}
    {Object.entries(mesas)
      .filter(([, m]) => m.llamada)
      .map(([mesaId]) => (
        <div
          key={mesaId}
          className="animate-pulse bg-danger text-white font-bold text-center py-3 px-4 rounded-xl shadow-lg mb-4"
        >
          🔔 Atención — Mesa {mesaId} está llamando
          <button
            className="ml-3 underline active:scale-95"
            onClick={() => document.getElementById(`mesa-${mesaId}`)?.scrollIntoView({ behavior: "smooth" })}
          >
            📍 Ir
          </button>
        </div>
      ))}

    {/* ✅ Logout */}
    <button
      onClick={() => {
        localStorage.removeItem("admin-auth");
        router.push("/admin");
      }}
      className="absolute top-4 right-4 bg-danger text-white px-3 py-1 rounded-xl font-bold shadow-md active:scale-95"
    >
      🔓 Salir
    </button>

    <h1 className="text-3xl font-bold text-center mb-6 text-textDark">
      📢 Panel Camarero
    </h1>

    {!soundReady && (
      <div className="flex justify-center mb-4">
        <button
          className="px-4 py-2 rounded-xl bg-primary text-white font-semibold active:scale-95"
          onClick={() =>
            dingRef.current?.play().finally(() => setSoundReady(true))
          }
        >
          🔊 Activar sonido
        </button>
      </div>
    )}

    {mesasActivas.length === 0 ? (
      <p className="text-center text-textMuted">No hay pedidos 😴</p>
    ) : (
      <div className="space-y-6">
        {mesasActivas.map(([mesaId, mesa]) => {
          const pendientes = mesa.items.filter((i) => !i.entregado).length;

          return (
            <div
              id={`mesa-${mesaId}`}
              key={mesaId}
              className={`p-4 rounded-xl shadow-md border border-border ${
                mesa.llamada ? "bg-danger/10 border-danger animate-pulse" : "bg-surface"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">Mesa {mesaId}</h2>

                {mesa.llamada && (
                  <span className="bg-danger text-white py-1 px-3 text-sm rounded-full font-semibold animate-pulse">
                    🛎️ Llamando
                  </span>
                )}

                {!mesa.llamada && pendientes > 0 && (
                  <span className="bg-danger text-white py-1 px-3 text-sm rounded-full font-semibold animate-pulse">
                    {pendientes} Pend.
                  </span>
                )}
              </div>

              {mesa.items.length > 0 && (
                <div className="space-y-2 mb-4">
                  {mesa.items.map((item) => (
                    <div
                      key={`${item.id}-${item.timestamp}`}
                      className={`flex justify-between items-center p-2 rounded-lg border text-sm ${
                        item.entregado
                          ? "bg-green-100 border-green-300"
                          : "bg-yellow-100 border-yellow-300"
                      }`}
                    >
                      <span>{item.qty}x {item.name}</span>

                      {!item.entregado && (
                        <button
                          onClick={() => marcarServido(mesaId, item.timestamp)}
                          className="px-2 py-1 rounded-xl text-xs font-semibold text-white bg-primary active:scale-95"
                        >
                          ✅ Servido
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mesa.llamada && (
                <button
                  onClick={() => atenderLlamada(mesaId)}
                  className="w-full bg-primary text-white py-2 rounded-xl font-bold shadow-md mb-2 active:scale-95"
                >
                  👋 Atender Llamada
                </button>
              )}

              <button
                onClick={() => cobrarMesa(mesaId)}
                className="w-full bg-primaryLight text-white py-2 rounded-xl font-bold shadow-md active:scale-95"
              >
                💳 Cobrar Mesa
              </button>
            </div>
          );
        })}
      </div>
    )}
  </main>
);
