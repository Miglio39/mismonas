// src/PvP.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

// Orden estricto oficial del álbum 2026
const seccionesAlbum = [
  { prefijo: "", nombre: "Especial Panini", bandera: "/logo_panini_especial.png", inicio: 0, fin: 0 },
  { prefijo: "FWC", nombre: "Especiales FIFA", bandera: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_logo_without_slogan.svg", inicio: 1, fin: 20 },
  { prefijo: "MEX", nombre: "México", bandera: "https://flagcdn.com/w40/mx.png", inicio: 1, fin: 20 },
  { prefijo: "RSA", nombre: "Sudáfrica", bandera: "https://flagcdn.com/w40/za.png", inicio: 1, fin: 20 },
  { prefijo: "KOR", nombre: "Corea del Sur", bandera: "https://flagcdn.com/w40/kr.png", inicio: 1, fin: 20 },
  { prefijo: "CZE", nombre: "República Checa", bandera: "https://flagcdn.com/w40/cz.png", inicio: 1, fin: 20 },
  { prefijo: "CAN", nombre: "Canadá", bandera: "https://flagcdn.com/w40/ca.png", inicio: 1, fin: 20 },
  { prefijo: "BIH", nombre: "Bosnia", bandera: "https://flagcdn.com/w40/ba.png", inicio: 1, fin: 20 },
  { prefijo: "QAT", nombre: "Qatar", bandera: "https://flagcdn.com/w40/qa.png", inicio: 1, fin: 20 },
  { prefijo: "SUI", nombre: "Suiza", bandera: "https://flagcdn.com/w40/ch.png", inicio: 1, fin: 20 },
  { prefijo: "BRA", nombre: "Brasil", bandera: "https://flagcdn.com/w40/br.png", inicio: 1, fin: 20 },
  { prefijo: "MAR", nombre: "Marruecos", bandera: "https://flagcdn.com/w40/ma.png", inicio: 1, fin: 20 },
  { prefijo: "HAI", nombre: "Haití", bandera: "https://flagcdn.com/w40/ht.png", inicio: 1, fin: 20 },
  { prefijo: "SCO", nombre: "Escocia", bandera: "https://flagcdn.com/w40/gb-sct.png", inicio: 1, fin: 20 },
  { prefijo: "USA", nombre: "Estados Unidos", bandera: "https://flagcdn.com/w40/us.png", inicio: 1, fin: 20 },
  { prefijo: "PAR", nombre: "Paraguay", bandera: "https://flagcdn.com/w40/py.png", inicio: 1, fin: 20 },
  { prefijo: "AUS", nombre: "Australia", bandera: "https://flagcdn.com/w40/au.png", inicio: 1, fin: 20 },
  { prefijo: "TUR", nombre: "Turquía", bandera: "https://flagcdn.com/w40/tr.png", inicio: 1, fin: 20 },
  { prefijo: "GER", nombre: "Alemania", bandera: "https://flagcdn.com/w40/de.png", inicio: 1, fin: 20 },
  { prefijo: "CUW", nombre: "Curazao", bandera: "https://flagcdn.com/w40/cw.png", inicio: 1, fin: 20 },
  { prefijo: "CIV", nombre: "Costa de Marfil", bandera: "https://flagcdn.com/w40/ci.png", inicio: 1, fin: 20 },
  { prefijo: "ECU", nombre: "Ecuador", bandera: "https://flagcdn.com/w40/ec.png", inicio: 1, fin: 20 },
  { prefijo: "NED", nombre: "Países Bajos", bandera: "https://flagcdn.com/w40/nl.png", inicio: 1, fin: 20 },
  { prefijo: "JPN", nombre: "Japón", bandera: "https://flagcdn.com/w40/jp.png", inicio: 1, fin: 20 },
  { prefijo: "SWE", nombre: "Suecia", bandera: "https://flagcdn.com/w40/se.png", inicio: 1, fin: 20 },
  { prefijo: "TUN", nombre: "Túnez", bandera: "https://flagcdn.com/w40/tn.png", inicio: 1, fin: 20 },
  { prefijo: "BEL", nombre: "Bélgica", bandera: "https://flagcdn.com/w40/be.png", inicio: 1, fin: 20 },
  { prefijo: "EGY", nombre: "Egipto", bandera: "https://flagcdn.com/w40/eg.png", inicio: 1, fin: 20 },
  { prefijo: "IRN", nombre: "Irán", bandera: "https://flagcdn.com/w40/ir.png", inicio: 1, fin: 20 },
  { prefijo: "NZL", nombre: "Nueva Zelanda", bandera: "https://flagcdn.com/w40/nz.png", inicio: 1, fin: 20 },
  { prefijo: "ESP", nombre: "España", bandera: "https://flagcdn.com/w40/es.png", inicio: 1, fin: 20 },
  { prefijo: "CPV", nombre: "Cabo Verde", bandera: "https://flagcdn.com/w40/cv.png", inicio: 1, fin: 20 },
  { prefijo: "KSA", nombre: "Arabia Saudita", bandera: "https://flagcdn.com/w40/sa.png", inicio: 1, fin: 20 },
  { prefijo: "URU", nombre: "Uruguay", bandera: "https://flagcdn.com/w40/uy.png", inicio: 1, fin: 20 },
  { prefijo: "FRA", nombre: "Francia", bandera: "https://flagcdn.com/w40/fr.png", inicio: 1, fin: 20 },
  { prefijo: "SEN", nombre: "Senegal", bandera: "https://flagcdn.com/w40/sn.png", inicio: 1, fin: 20 },
  { prefijo: "IRQ", nombre: "Irak", bandera: "https://flagcdn.com/w40/iq.png", inicio: 1, fin: 20 },
  { prefijo: "NOR", nombre: "Noruega", bandera: "https://flagcdn.com/w40/no.png", inicio: 1, fin: 20 },
  { prefijo: "ARG", nombre: "Argentina", bandera: "https://flagcdn.com/w40/ar.png", inicio: 1, fin: 20 },
  { prefijo: "ALG", nombre: "Argelia", bandera: "https://flagcdn.com/w40/dz.png", inicio: 1, fin: 20 },
  { prefijo: "AUT", nombre: "Austria", bandera: "https://flagcdn.com/w40/at.png", inicio: 1, fin: 20 },
  { prefijo: "JOR", nombre: "Jordania", bandera: "https://flagcdn.com/w40/jo.png", inicio: 1, fin: 20 },
  { prefijo: "POR", nombre: "Portugal", bandera: "https://flagcdn.com/w40/pt.png", inicio: 1, fin: 20 },
  { prefijo: "COD", nombre: "RD Congo", bandera: "https://flagcdn.com/w40/cd.png", inicio: 1, fin: 20 },
  { prefijo: "UZB", nombre: "Uzbekistán", bandera: "https://flagcdn.com/w40/uz.png", inicio: 1, fin: 20 },
  { prefijo: "COL", nombre: "Colombia", bandera: "https://flagcdn.com/w40/co.png", inicio: 1, fin: 20 },
  { prefijo: "ENG", nombre: "Inglaterra", bandera: "https://flagcdn.com/w40/gb-eng.png", inicio: 1, fin: 20 },
  { prefijo: "CRO", nombre: "Croacia", bandera: "https://flagcdn.com/w40/hr.png", inicio: 1, fin: 20 },
  { prefijo: "GHA", nombre: "Ghana", bandera: "https://flagcdn.com/w40/gh.png", inicio: 1, fin: 20 },
  { prefijo: "PAN", nombre: "Panamá", bandera: "https://flagcdn.com/w40/pa.png", inicio: 1, fin: 20 },
  { prefijo: "CC", nombre: "Coca-Cola", bandera: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg", inicio: 1, fin: 14 }
];

function PvP({ usuario }) {
  const [inventario, setInventario] = useState({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Arrays con las monas seleccionadas para el trueque
  const [doy, setDoy] = useState([]);
  const [recibo, setRecibo] = useState([]);

  useEffect(() => {
    const cargarInventario = async () => {
      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInventario(docSnap.data());
      }
      setCargando(false);
    };
    cargarInventario();
  }, [usuario]);

  // Clasificamos el inventario respetando el orden oficial
  let misRepetidas = [];
  let misFaltantes = [];

  seccionesAlbum.forEach(seccion => {
    for (let i = seccion.inicio; i <= seccion.fin; i++) {
      let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
      let cant = inventario[codigo] || 0;
      
      // Aplicamos filtro de búsqueda si el usuario escribe algo
      if (busqueda === '' || codigo.includes(busqueda.toUpperCase())) {
        if (cant > 1) misRepetidas.push(codigo);
        if (cant === 0) misFaltantes.push(codigo);
      }
    }
  });

  const toggleDoy = (codigo) => {
    if (doy.includes(codigo)) setDoy(doy.filter(c => c !== codigo));
    else setDoy([...doy, codigo]);
  };

  const toggleRecibo = (codigo) => {
    if (recibo.includes(codigo)) setRecibo(recibo.filter(c => c !== codigo));
    else setRecibo([...recibo, codigo]);
  };

  const ejecutarTrueque = async () => {
    if (doy.length === 0 || recibo.length === 0) {
      alert("⚠️ Selecciona al menos una mona para dar y una para recibir.");
      return;
    }

    const confirmacion = window.confirm(`🤝 ¿Confirmas el trueque?\n\nEntregas: ${doy.join(", ")}\nRecibes: ${recibo.join(", ")}`);
    if (!confirmacion) return;

    setCargando(true);
    const nuevoInventario = { ...inventario };
    const actualizaciones = {};

    // Restamos las que damos
    doy.forEach(codigo => {
      nuevoInventario[codigo] = (nuevoInventario[codigo] || 0) - 1;
      actualizaciones[codigo] = nuevoInventario[codigo];
    });

    // Sumamos las que recibimos
    recibo.forEach(codigo => {
      nuevoInventario[codigo] = (nuevoInventario[codigo] || 0) + 1;
      actualizaciones[codigo] = nuevoInventario[codigo];
    });

    try {
      const docRef = doc(db, "inventarios", usuario.uid);
      await updateDoc(docRef, actualizaciones);
      
      setInventario(nuevoInventario);
      setDoy([]);
      setRecibo([]);
      setBusqueda('');
      alert("✅ ¡Trueque exitoso! Inventario actualizado.");
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar el trueque.");
    }
    setCargando(false);
  };

  if (cargando) return <div style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold", color: WC_COLORS.darkBlue }}>Actualizando mesa de cambios... ⚽</div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "800px", margin: "auto", padding: "10px", paddingBottom: "100px" }}>
      
      <div style={{ background: WC_COLORS.darkBlue, color: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 5px 0", fontWeight: "900" }}>🤝 Modo PvP (Trueque en Vivo)</h2>
        <p style={{ margin: 0, fontSize: "0.9em", opacity: 0.9 }}>Selecciona las que entregas y las que recibes.</p>
      </div>

      <input 
        type="text" 
        placeholder="🔍 Búsqueda rápida (Ej: ARG, COL...)" 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value.toUpperCase().trim())}
        style={{ width: "100%", padding: "15px", borderRadius: "12px", border: `2px solid ${WC_COLORS.darkBlue}`, fontSize: "1.1em", boxSizing: "border-box", marginBottom: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        
        {/* COLUMNA: LO QUE DOY */}
        <div style={{ flex: "1 1 300px", background: "rgba(0, 163, 224, 0.1)", padding: "15px", borderRadius: "12px", border: `2px solid ${WC_COLORS.lightBlue}` }}>
          <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.darkBlue, textAlign: "center" }}>
            📤 Mis Repetidas (Entrego)
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "300px", overflowY: "auto", padding: "5px" }}>
            {misRepetidas.length === 0 ? <p style={{ width: "100%", textAlign: "center", color: "#64748b" }}>No tienes repetidas disponibles.</p> : null}
            {misRepetidas.map(codigo => (
              <button 
                key={`doy-${codigo}`}
                onClick={() => toggleDoy(codigo)}
                style={{
                  background: doy.includes(codigo) ? WC_COLORS.lightBlue : "white",
                  color: doy.includes(codigo) ? "white" : WC_COLORS.darkBlue,
                  border: `1px solid ${WC_COLORS.lightBlue}`,
                  padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer",
                  transition: "0.2s", fontSize: "0.95em"
                }}
              >
                {codigo}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA: LO QUE RECIBO */}
        <div style={{ flex: "1 1 300px", background: "rgba(0, 177, 64, 0.1)", padding: "15px", borderRadius: "12px", border: `2px solid ${WC_COLORS.green}` }}>
          <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.green, textAlign: "center" }}>
            📥 Mis Faltantes (Recibo)
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "300px", overflowY: "auto", padding: "5px" }}>
            {misFaltantes.length === 0 ? <p style={{ width: "100%", textAlign: "center", color: "#64748b" }}>¡Álbum lleno!</p> : null}
            {misFaltantes.map(codigo => (
              <button 
                key={`recibo-${codigo}`}
                onClick={() => toggleRecibo(codigo)}
                style={{
                  background: recibo.includes(codigo) ? WC_COLORS.green : "white",
                  color: recibo.includes(codigo) ? "white" : WC_COLORS.green,
                  border: `1px solid ${WC_COLORS.green}`,
                  padding: "8px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer",
                  transition: "0.2s", fontSize: "0.95em"
                }}
              >
                {codigo}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* BARRA FLOTANTE DE CONFIRMACIÓN */}
      {(doy.length > 0 || recibo.length > 0) && (
        <div style={{
          position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
          background: "white", padding: "15px 25px", borderRadius: "50px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "20px",
          zIndex: 1000, border: `3px solid ${WC_COLORS.darkBlue}`, width: "90%", maxWidth: "500px",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", gap: "15px", fontWeight: "bold", fontSize: "1.1em" }}>
            <span style={{ color: WC_COLORS.lightBlue }}>📤 {doy.length}</span>
            <span style={{ color: WC_COLORS.green }}>📥 {recibo.length}</span>
          </div>
          <button 
            onClick={ejecutarTrueque}
            style={{
              background: WC_COLORS.darkBlue, color: "white", border: "none", padding: "10px 20px",
              borderRadius: "30px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase",
              fontSize: "0.9em", transition: "0.2s"
            }}
          >
            Confirmar Trueque
          </button>
        </div>
      )}

    </div>
  );
}

export default PvP;