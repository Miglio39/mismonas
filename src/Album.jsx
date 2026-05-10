// src/Album.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const seccionesAlbum = [
    { prefijo: "", nombre: "Panini 00", inicio: 0, fin: 0 },
    { prefijo: "FWC", nombre: "Especiales FIFA", inicio: 1, fin: 20 }, 
    { prefijo: "USA", nombre: "Estados Unidos", inicio: 1, fin: 20 }, { prefijo: "MEX", nombre: "México", inicio: 1, fin: 20 }, { prefijo: "CAN", nombre: "Canadá", inicio: 1, fin: 20 }, { prefijo: "CRC", nombre: "Costa Rica", inicio: 1, fin: 20 }, { prefijo: "PAN", nombre: "Panamá", inicio: 1, fin: 20 }, { prefijo: "JAM", nombre: "Jamaica", inicio: 1, fin: 20 }, { prefijo: "HON", nombre: "Honduras", inicio: 1, fin: 20 }, { prefijo: "GUA", nombre: "Guatemala", inicio: 1, fin: 20 },
    { prefijo: "ARG", nombre: "Argentina", inicio: 1, fin: 20 }, { prefijo: "BRA", nombre: "Brasil", inicio: 1, fin: 20 }, { prefijo: "COL", nombre: "Colombia", inicio: 1, fin: 20 }, { prefijo: "URU", nombre: "Uruguay", inicio: 1, fin: 20 }, { prefijo: "ECU", nombre: "Ecuador", inicio: 1, fin: 20 }, { prefijo: "VEN", nombre: "Venezuela", inicio: 1, fin: 20 },
    { prefijo: "ESP", nombre: "España", inicio: 1, fin: 20 }, { prefijo: "ENG", nombre: "Inglaterra", inicio: 1, fin: 20 }, { prefijo: "FRA", nombre: "Francia", inicio: 1, fin: 20 }, { prefijo: "GER", nombre: "Alemania", inicio: 1, fin: 20 }, { prefijo: "POR", nombre: "Portugal", inicio: 1, fin: 20 }, { prefijo: "ITA", nombre: "Italia", inicio: 1, fin: 20 }, { prefijo: "NED", nombre: "Países Bajos", inicio: 1, fin: 20 }, { prefijo: "CRO", nombre: "Croacia", inicio: 1, fin: 20 }, { prefijo: "BEL", nombre: "Bélgica", inicio: 1, fin: 20 }, { prefijo: "SUI", nombre: "Suiza", inicio: 1, fin: 20 }, { prefijo: "DEN", nombre: "Dinamarca", inicio: 1, fin: 20 }, { prefijo: "SRB", nombre: "Serbia", inicio: 1, fin: 20 }, { prefijo: "POL", nombre: "Polonia", inicio: 1, fin: 20 }, { prefijo: "AUT", nombre: "Austria", inicio: 1, fin: 20 }, { prefijo: "UKR", nombre: "Ucrania", inicio: 1, fin: 20 }, { prefijo: "TUR", nombre: "Turquía", inicio: 1, fin: 20 },
    { prefijo: "MAR", nombre: "Marruecos", inicio: 1, fin: 20 }, { prefijo: "SEN", nombre: "Senegal", inicio: 1, fin: 20 }, { prefijo: "EGY", nombre: "Egipto", inicio: 1, fin: 20 }, { prefijo: "CIV", nombre: "Costa de Marfil", inicio: 1, fin: 20 }, { prefijo: "NGA", nombre: "Nigeria", inicio: 1, fin: 20 }, { prefijo: "ALG", nombre: "Argelia", inicio: 1, fin: 20 }, { prefijo: "CMR", nombre: "Camerún", inicio: 1, fin: 20 }, { prefijo: "GHA", nombre: "Ghana", inicio: 1, fin: 20 }, { prefijo: "MLI", nombre: "Malí", inicio: 1, fin: 20 },
    { prefijo: "JPN", nombre: "Japón", inicio: 1, fin: 20 }, { prefijo: "KOR", nombre: "Corea del Sur", inicio: 1, fin: 20 }, { prefijo: "IRN", nombre: "Irán", inicio: 1, fin: 20 }, { prefijo: "KSA", nombre: "Arabia Saudita", inicio: 1, fin: 20 }, { prefijo: "AUS", nombre: "Australia", inicio: 1, fin: 20 }, { prefijo: "QAT", nombre: "Qatar", inicio: 1, fin: 20 }, { prefijo: "UZB", nombre: "Uzbekistán", inicio: 1, fin: 20 }, { prefijo: "IRQ", nombre: "Irak", inicio: 1, fin: 20 },
    { prefijo: "NZL", nombre: "Nueva Zelanda", inicio: 1, fin: 20 },
    { prefijo: "CC", nombre: "Coca-Cola", inicio: 1, fin: 14 }
];

function Album({ usuario }) {
  const [inventario, setInventario] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarInventario = async () => {
      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      let dataDB = docSnap.exists() ? docSnap.data() : {};
      let necesitaActualizar = !docSnap.exists();

      seccionesAlbum.forEach(seccion => {
        for (let i = seccion.inicio; i <= seccion.fin; i++) {
          let num = i < 10 ? '0' + i : i;
          let codigo = `${seccion.prefijo}${num}`;
          if (dataDB[codigo] === undefined) {
            dataDB[codigo] = 0;
            necesitaActualizar = true;
          }
        }
      });

      setInventario(dataDB);
      if (necesitaActualizar) await setDoc(docRef, dataDB);
      setCargando(false);
    };
    cargarInventario();
  }, [usuario]);

  const modificarCantidad = async (codigo, delta) => {
    const nuevaCantidad = Math.max(0, (inventario[codigo] || 0) + delta);
    setInventario({ ...inventario, [codigo]: nuevaCantidad });
    const docRef = doc(db, "inventarios", usuario.uid);
    await updateDoc(docRef, { [codigo]: nuevaCantidad });
  };

  if (cargando) return <p style={{textAlign: "center", marginTop: "50px"}}>Cargando inventario...</p>;

  // Cálculo de estadísticas
  let faltan = 0, llevo = 0, repetidasTotales = 0;
  seccionesAlbum.forEach(seccion => {
    for (let i = seccion.inicio; i <= seccion.fin; i++) {
      let num = i < 10 ? '0' + i : i;
      let codigo = `${seccion.prefijo}${num}`;
      let cant = inventario[codigo] || 0;
      if (cant === 0) faltan++;
      if (cant >= 1) llevo++;
      if (cant > 1) repetidasTotales += (cant - 1);
    }
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", maxWidth: "800px", margin: "auto" }}>
      
      {/* Contadores */}
      <div style={{ display: "flex", justifyContent: "space-between", background: "#002b5e", color: "white", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ textAlign: "center", flex: "1" }}>Faltan <span style={{ display: "block", fontSize: "1.5em", fontWeight: "bold", color: "#fca5a5" }}>{faltan}</span></div>
        <div style={{ textAlign: "center", flex: "1" }}>Llevo <span style={{ display: "block", fontSize: "1.5em", fontWeight: "bold", color: "#86efac" }}>{llevo}</span></div>
        <div style={{ textAlign: "center", flex: "1" }}>Repetidas <span style={{ display: "block", fontSize: "1.5em", fontWeight: "bold", color: "#fde047" }}>{repetidasTotales}</span></div>
      </div>

      {/* Buscador Dinámico */}
      <div style={{ marginBottom: "25px" }}>
        <input 
          type="text" 
          placeholder="🔍 Buscar mona (ej: POR14, ARG, 05...)" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
          style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #002b5e", fontSize: "1em", boxSizing: "border-box" }}
        />
      </div>

      {/* Listado de Monas */}
      <div>
        {seccionesAlbum.map(seccion => {
          // Filtrar monas de la sección según la búsqueda
          const monasVisibles = [];
          for (let i = seccion.inicio; i <= seccion.fin; i++) {
            let num = i < 10 ? '0' + i : i;
            let codigo = `${seccion.prefijo}${num}`;
            if (codigo.includes(busqueda) || seccion.nombre.toUpperCase().includes(busqueda)) {
              monasVisibles.push(codigo);
            }
          }

          // Si la sección no tiene monas que coincidan con la búsqueda, no la mostramos
          if (monasVisibles.length === 0) return null;

          return (
            <div key={seccion.nombre} style={{ marginBottom: "20px" }}>
              <div style={{ background: "#e2e8f0", padding: "10px", borderRadius: "5px", fontWeight: "bold", color: "#002b5e" }}>
                {seccion.nombre} {seccion.prefijo ? `(${seccion.prefijo})` : ""}
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))", gap: "10px", padding: "15px 0" }}>
                {monasVisibles.map(codigo => {
                  const cant = inventario[codigo] || 0;
                  const esTengo = cant >= 1;
                  const esRepetida = cant > 1;

                  return (
                    <div key={codigo} style={{ position: "relative" }}>
                      <div 
                        onClick={() => modificarCantidad(codigo, 1)}
                        style={{ 
                          background: esRepetida ? "#fbbf24" : esTengo ? "#4ade80" : "#e2e8f0",
                          color: esTengo && !esRepetida ? "white" : "black",
                          padding: "15px 5px", textAlign: "center", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", transition: "0.1s"
                        }}
                      >
                        {codigo}
                        {cant > 1 && <div style={{ fontSize: "0.8em", marginTop: "4px" }}>x{cant}</div>}
                      </div>
                      
                      {/* Botón para restar cantidad */}
                      {cant > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); modificarCantidad(codigo, -1); }}
                          style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          -
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Album;