import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function TruequeInteligente({ usuario }) {
  const [faltantes, setFaltantes] = useState([]);
  const [topBuscadas, setTopBuscadas] = useState([]);
  const [cantidad, setCantidad] = useState(10);
  const [resultado, setResultado] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const invSnap = await getDoc(doc(db, "inventarios", usuario.uid));
    const inv = invSnap.data() || {};

    const faltan = Object.keys(inv).filter(k => inv[k] === 0);
    setFaltantes(faltan);

    const mercadoSnap = await getDoc(doc(db, "estadisticas", "mercado_global"));

    if (mercadoSnap.exists()) {
      const top = Object.entries(
        mercadoSnap.data().faltantes || {}
      )
        .sort((a,b)=>b[1]-a[1])
        .slice(0,50)
        .map(x=>x[0]);

      setTopBuscadas(top);
    }
  };

  const generarTrueque = () => {
    let picks = [];

    // prioridad faltantes
    for (let m of faltantes) {
      if (picks.length < cantidad) picks.push(m);
    }

    // completar con top mercado
    for (let m of topBuscadas) {
      if (!picks.includes(m) && picks.length < cantidad) {
        picks.push(m);
      }
    }

    setResultado(picks);
  };

  return (
    <div>
      <h2>Radar Trueque Inteligente</h2>

      <select
        value={cantidad}
        onChange={(e)=>setCantidad(Number(e.target.value))}
      >
        <option value={1}>1 x 1</option>
        <option value={5}>5 x 5</option>
        <option value={10}>10 x 10</option>
      </select>

      <button onClick={generarTrueque}>
        Generar Propuesta
      </button>

      <div>
        <h3>Recibir</h3>
        {resultado.map(m=>(
          <span key={m}>{m} </span>
        ))}
      </div>
    </div>
  );
}

export default TruequeInteligente;