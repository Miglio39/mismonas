// src/Estadisticas.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function Estadisticas() {
  const [monasComunes, setMonasComunes] = useState([]);
  const [monasDificiles, setMonasDificiles] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const generarEstadisticas = async () => {
      try {
        const inventariosRef = collection(db, "inventarios");
        const snapshot = await getDocs(inventariosRef);
        
        setTotalUsuarios(snapshot.size);

        // Diccionario para acumular las sumatorias de cada mona
        const conteoGlobal = {};

        snapshot.forEach(doc => {
          const inventario = doc.data();
          
          for (const [codigo, cantidad] of Object.entries(inventario)) {
            // Ignorar campos que no sean códigos de monas
            if (codigo === 'ubicacion' || codigo === 'ultimaActualizacion') continue;

            if (!conteoGlobal[codigo]) {
              conteoGlobal[codigo] = 0;
            }
            // Sumamos cuántas copias existen en total de esa mona en la comunidad
            conteoGlobal[codigo] += cantidad;
          }
        });

        // Convertir el diccionario en un arreglo para poder ordenarlo
        const arregloEstadisticas = Object.keys(conteoGlobal).map(codigo => ({
          codigo,
          total: conteoGlobal[codigo]
        }));

        // Ordenar de mayor a menor (Las que más salen)
        const comunes = [...arregloEstadisticas].sort((a, b) => b.total - a.total).slice(0, 10);
        
        // Ordenar de menor a mayor (Las que menos salen)
        const dificiles = [...arregloEstadisticas].sort((a, b) => a.total - b.total).slice(0, 10);

        setMonasComunes(comunes);
        setMonasDificiles(dificiles);
        setCargando(false);

      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        setCargando(false);
      }
    };

    generarEstadisticas();
  }, []);

  if (cargando) return <p style={{textAlign: "center", marginTop: "40px"}}>Analizando la base de datos global...</p>;

  return (
    <div style={{ marginTop: "20px" }}>
      <div style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
        <p>Datos basados en el inventario de <b>{totalUsuarios}</b> coleccionistas registrados.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between" }}>
        
        {/* Columna: Las que más salen */}
        <div style={{ flex: "1 1 300px", background: "#f0fdf4", border: "2px solid #4ade80", borderRadius: "10px", padding: "15px" }}>
          <h3 style={{ color: "#166534", textAlign: "center", marginTop: "0" }}>🟢 Más Comunes</h3>
          <p style={{ textAlign: "center", fontSize: "0.85em", color: "#666" }}>(Abundan para cambios)</p>
          
          <ul style={{ listStyle: "none", padding: "0" }}>
            {monasComunes.map((mona, index) => (
              <li key={mona.codigo} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #bbf7d0", fontWeight: index < 3 ? "bold" : "normal" }}>
                <span>#{index + 1} <b>{mona.codigo}</b></span>
                <span style={{ color: "#16a34a" }}>{mona.total} copias</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna: Las que menos salen */}
        <div style={{ flex: "1 1 300px", background: "#fef2f2", border: "2px solid #f87171", borderRadius: "10px", padding: "15px" }}>
          <h3 style={{ color: "#991b1b", textAlign: "center", marginTop: "0" }}>🔴 Más Difíciles</h3>
          <p style={{ textAlign: "center", fontSize: "0.85em", color: "#666" }}>(Las más buscadas)</p>
          
          <ul style={{ listStyle: "none", padding: "0" }}>
            {monasDificiles.map((mona, index) => (
              <li key={mona.codigo} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #fecaca", fontWeight: index < 3 ? "bold" : "normal" }}>
                <span>#{index + 1} <b>{mona.codigo}</b></span>
                <span style={{ color: "#dc2626" }}>{mona.total} copias</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Estadisticas;