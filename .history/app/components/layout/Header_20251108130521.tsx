const [alertas, setAlertas] = useState({
  cocina: false,
  llamadas: false,
  cuentas: false,
});

useEffect(() => {
  const pedidos = new BroadcastChannel("pedidos_channel");

  pedidos.onmessage = (ev) => {
    const data = ev.data;
    if (!data?.mesas) return;

    const mesas = Object.values(data.mesas);

    const cocinaActiva = mesas.some((m: any) =>
      m.items?.some((i: any) => i.estado === "preparando" || i.estado === "pendienteCocina")
    );

    const llamadasActivas = mesas.some((m: any) => m.llamada);
    const cuentasActivas = mesas.some((m: any) => m.cuentaSolicitada);

    setAlertas({
      cocina: cocinaActiva,
      llamadas: llamadasActivas,
      cuentas: cuentasActivas,
    });
  };

  return () => pedidos.close();
}, []);
