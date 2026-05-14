// src/PvP.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

const seccionesAlbum = [
  { prefijo: "", nombre: "Especial Panini", bandera: "/logo_panini_especial.png", inicio: 0, fin: 0 },
  { prefijo: "FWC", nombre: "Especiales FIFA", bandera: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_logo_without_slogan.svg", inicio: 1, fin: 20 },
  { prefijo: "USA", nombre: "Estados Unidos", bandera: "https://flagcdn.com/w40/us.png", inicio: 1, fin: 20 },
  { prefijo: "MEX", nombre: "México", bandera: "https://flagcdn.com/w40/mx.png", inicio: 1, fin: 20 },
  { prefijo: "CAN", nombre: "Canadá", bandera: "https://flagcdn.com/w40/ca.png", inicio: 1, fin: 20 },
  { prefijo: "PAN", nombre: "Panamá", bandera: "https://flagcdn.com/w40/pa.png", inicio: 1, fin: 20 },
  { prefijo: "HAI", nombre: "Haití", bandera: "https://flagcdn.com/w40/ht.png", inicio: 1, fin: 20 },
  { prefijo: "CUW", nombre: "Curazao", bandera: "https://flagcdn.com/w40/cw.png", inicio: 1, fin: 20 },
  { prefijo: "ARG", nombre: "Argentina", bandera: "https://flagcdn.com/w40/ar.png", inicio: 1, fin: 20 },
  { prefijo: "BRA", nombre: "Brasil", bandera: "https://flagcdn.com/w40/br.png", inicio: 1, fin: 20 },
  { prefijo: "COL", nombre: "Colombia", bandera: "https://flagcdn.com/w40/co.png", inicio: 1, fin: 20 },
  { prefijo: "URU", nombre: "Uruguay", bandera: "https://flagcdn.com/w40/uy.png", inicio: 1, fin: 20 },
  { prefijo: "ECU", nombre: "Ecuador", bandera: "https://flagcdn.com/w40/ec.png", inicio: 1, fin: 20 },
  { prefijo: "PAR", nombre: "Paraguay", bandera: "https://flagcdn.com/w40/py.png", inicio: 1, fin: 20 },
  { prefijo: "ESP", nombre: "España", bandera: "https://flagcdn.com/w40/es.png", inicio: 1, fin: 20 },
  { prefijo: "ENG", nombre: "Inglaterra", bandera: "https://flagcdn.com/w40/gb-eng.png", inicio: 1, fin: 20 },
  { prefijo: "FRA", nombre: "Francia", bandera: "https://flagcdn.com/w40/fr.png", inicio: 1, fin: 20 },
  { prefijo: "GER", nombre: "Alemania", bandera: "https://flagcdn.com/w40/de.png", inicio: 1, fin: 20 },
  { prefijo: "POR", nombre: "Portugal", bandera: "https://flagcdn.com/w40/pt.png", inicio: 1, fin: 20 },
  { prefijo: "NED", nombre: "Países Bajos", bandera: "https://flagcdn.com/w40/nl.png", inicio: 1, fin: 20 },
  { prefijo: "CRO", nombre: "Croacia", bandera: "https://flagcdn.com/w40/hr.png", inicio: 1, fin: 20 },
  { prefijo: "BEL", nombre: "Bélgica", bandera: "https://flagcdn.com/w40/be.png", inicio: 1, fin: 20 },
  { prefijo: "SUI", nombre: "Suiza", bandera: "https://flagcdn.com/w40/ch.png", inicio: 1, fin: 20 },
  { prefijo: "AUT", nombre: "Austria", bandera: "https://flagcdn.com/w40/at.png", inicio: 1, fin: 20 },
  { prefijo: "TUR", nombre: "Turquía", bandera: "https://flagcdn.com/w40/tr.png", inicio: 1, fin: 20 },
  { prefijo: "BIH", nombre: "Bosnia", bandera: "https://flagcdn.com/w40/ba.png", inicio: 1, fin: 20 },
  { prefijo: "SCO", nombre: "Escocia", bandera: "https://flagcdn.com/w40/gb-sct.png", inicio: 1, fin: 20 },
  { prefijo: "SWE", nombre: "Suecia", bandera: "https://flagcdn.com/w40/se.png", inicio: 1, fin: 20 },
  { prefijo: "NOR", nombre: "Noruega", bandera: "https://flagcdn.com/w40/no.png", inicio: 1, fin: 20 },
  { prefijo: "CZE", nombre: "República Checa", bandera: "https://flagcdn.com/w40/cz.png", inicio: 1, fin: 20 },
  { prefijo: "MAR", nombre: "Marruecos", bandera: "https://flagcdn.com/w40/ma.png", inicio: 1, fin: 20 },
  { prefijo: "SEN", nombre: "Senegal", bandera: "https://flagcdn.com/w40/sn.png", inicio: 1, fin: 20 },
  { prefijo: "EGY", nombre: "Egipto", bandera: "https://flagcdn.com/w40/eg.png", inicio: 1, fin: 20 },
  { prefijo: "CIV", nombre: "Costa de Marfil", bandera: "https://flagcdn.com/w40/ci.png", inicio: 1, fin: 20 },
  { prefijo: "ALG", nombre: "Argelia", bandera: "https://flagcdn.com/w40/dz.png", inicio: 1, fin: 20 },
  { prefijo: "GHA", nombre: "Ghana", bandera: "https://flagcdn.com/w40/gh.png", inicio: 1, fin: 20 },
  { prefijo: "RSA", nombre: "Sudáfrica", bandera: "https://flagcdn.com/w40/za.png", inicio: 1, fin: 20 },
  { prefijo: "TUN", nombre: "Túnez", bandera: "https://flagcdn.com/w40/tn.png", inicio: 1, fin: 20 },
  { prefijo: "COD", nombre: "RD Congo", bandera: "https://flagcdn.com/w40/cd.png", inicio: 1, fin: 20 },
  { prefijo: "CPV", nombre: "Cabo Verde", bandera: "https://flagcdn.com/w40/cv.png", inicio: 1, fin: 20 },
  { prefijo: "JPN", nombre: "Japón", bandera: "https://flagcdn.com/w40/jp.png", inicio: 1, fin: 20 },
  { prefijo: "KOR", nombre: "Corea del Sur", bandera: "https://flagcdn.com/w40/kr.png", inicio: 1, fin: 20 },
  { prefijo: "IRN", nombre: "Irán", bandera: "https://flagcdn.com/w40/ir.png", inicio: 1, fin: 20 },
  { prefijo: "KSA", nombre: "Arabia Saudita", bandera: "https://flagcdn.com/w40/sa.png", inicio: 1, fin: 20 },
  { prefijo: "AUS", nombre: "Australia", bandera: "https://flagcdn.com/w40/au.png", inicio: 1, fin: 20 },
  { prefijo: "QAT", nombre: "Qatar", bandera: "https://flagcdn.com/w40/qa.png", inicio: 1, fin: 20 },
  { prefijo: "IRQ", nombre: "Irak", bandera: "https://flagcdn.com/w40/iq.png", inicio: 1, fin: 20 },
  { prefijo: "JOR", nombre: "Jordania", bandera: "https://flagcdn.com/w40/jo.png", inicio: 1, fin: 20 },
  { prefijo: "UZB", nombre: "Uzbekistán", bandera: "https://flagcdn.com/w40/uz.png", inicio: 1, fin: 20 },
  { prefijo: "NZL", nombre: "Nueva Zelanda", bandera: "https://flagcdn.com/w40/nz.png", inicio: 1, fin: 20 },
  { prefijo: "CC", nombre: "Coca-Cola", bandera: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg", inicio: 1, fin: 14 }
];

function PvP({ usuario }) {
  const [inventario, setInventario] = useState({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [doy, setDoy] = useState([]);
  const [recibo, setRecibo] = useState([]);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [matchUid, setMatchUid] = useState(() => new URLSearchParams(window.location.search).get('match'));

  useEffect(() => {
    const cargarDatos = async () => {
      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      let miInv = {};
      if (docSnap.exists()) {
        miInv = docSnap.data();
        setInventario(miInv);
      }

      if (matchUid && matchUid !== usuario.uid) {
        const otroRef = doc(db, "inventarios", matchUid);
        const otroSnap = await getDoc(otroRef);
        
        if (otroSnap.exists()) {
          const otroInv = otroSnap.data();
          let autoDoy = [];
          let autoRecibo = [];

          seccionesAlbum.forEach(seccion => {
            for (let i = seccion.inicio; i <= seccion.fin; i++) {
              let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
              let miCant = miInv[codigo] || 0;
              let otroCant = otroInv[codigo] || 0;

              if (miCant > 1 && otroCant === 0) autoDoy.push(codigo);
              if (miCant === 0 && otroCant > 1) autoRecibo.push(codigo);
            }
          });

          setDoy(autoDoy);
          setRecibo(autoRecibo);
        }
      } else if (matchUid === usuario.uid) {
         alert("😅 Acabas de escanear tu propio código QR.");
         window.history.replaceState(null, '', window.location.pathname);
         setMatchUid(null);
      }
      
      setCargando(false);
    };
    cargarDatos();
  }, [usuario, matchUid]);

  let misRepetidas = [];
  let misFaltantes = [];

  seccionesAlbum.forEach(seccion => {
    for (let i = seccion.inicio; i <= seccion.fin; i++) {
      let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
      let cant = inventario[codigo] || 0;
      
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

    doy.forEach(codigo => {
      nuevoInventario[codigo] = (nuevoInventario[codigo] || 0) - 1;
      actualizaciones[codigo] = nuevoInventario[codigo];
    });

    recibo.forEach(codigo => {
      nuevoInventario[codigo] = (nuevoInventario[codigo] || 0) + 1;
      actualizaciones[codigo] = nuevoInventario[codigo];
    });

    try {
      const docRef = doc(db, "inventarios", usuario.uid);
      await updateDoc(docRef, actualizaciones);

      if (matchUid) {
        try {
          const otroRef = doc(db, "inventarios", matchUid);
          const otroSnap = await getDoc(otroRef);
          if (otroSnap.exists()) {
            let invOtro = otroSnap.data();
            let actualizacionesOtro = {};
            doy.forEach(codigo => { actualizacionesOtro[codigo] = (invOtro[codigo] || 0) + 1; });
            recibo.forEach(codigo => { actualizacionesOtro[codigo] = Math.max(0, (invOtro[codigo] || 0) - 1); });
            await updateDoc(otroRef, actualizacionesOtro);
          }
        } catch (e) {
          console.warn("No se pudo actualizar el álbum del otro usuario.");
        }
        window.history.replaceState(null, '', window.location.pathname);
        setMatchUid(null);
      }

      setInventario(nuevoInventario);
      setDoy([]);
      setRecibo([]);
      setBusqueda('');
      alert("✅ ¡Trueque exitoso! Inventarios actualizados.");
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar el trueque.");
    }
    setCargando(false);
  };

  if (cargando) return <div style={{ textAlign: "center", marginTop: "50px", fontWeight: "bold", color: WC_COLORS.darkBlue }}>Actualizando mesa de cambios... ⚽</div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "800px", margin: "auto", padding: "10px", paddingBottom: "100px" }}>
      
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <button 
          onClick={() => setMostrarQR(true)}
          style={{
            background: `linear-gradient(135deg, ${WC_COLORS.darkBlue}, ${WC_COLORS.lightBlue})`,
            color: "white", padding: "15px 30px", borderRadius: "30px",
            border: "none", fontWeight: "900", fontSize: "1.1em", textTransform: "uppercase",
            cursor: "pointer", boxShadow: "0 8px 20px rgba(0, 163, 224, 0.4)",
            display: "inline-flex", alignItems: "center", gap: "10px"
          }}
        >
          📷 Mostrar mi Código QR
        </button>
      </div>

      {mostrarQR && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,32,91,0.8)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999, padding: "20px", backdropFilter: "blur(5px)"
        }}>
          <div style={{ background: "white", padding: "40px 30px", borderRadius: "24px", textAlign: "center", maxWidth: "350px", width: "100%", boxShadow: "0 15px 40px rgba(0,0,0,0.5)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: WC_COLORS.darkBlue, fontSize: "1.6em", fontWeight: "900" }}>Tu Código de Cambio</h3>
            <div style={{ background: "white", padding: "15px", borderRadius: "16px", border: `3px dashed ${WC_COLORS.lightBlue}`, display: "inline-block" }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mismonas.online/?match=${usuario.uid}`} alt="QR" style={{ width: "200px", height: "200px" }} />
            </div>
            <button onClick={() => setMostrarQR(false)} style={{ display: "block", width: "100%", background: WC_COLORS.red, color: "white", padding: "15px", borderRadius: "12px", border: "none", fontWeight: "900", fontSize: "1.1em", marginTop: "30px", cursor: "pointer" }}>Cerrar</button>
          </div>
        </div>
      )}

      <div style={{ background: WC_COLORS.darkBlue, color: "white", padding: "20px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 5px 0", fontWeight: "900" }}>🤝 Modo PvP (Trueque en Vivo)</h2>
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
          <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.darkBlue, textAlign: "center", fontSize: "1em" }}>📤 Entrego (Repetidas)</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "8px", 
            maxHeight: "350px", 
            overflowY: "auto", 
            padding: "5px" 
          }}>
            {misRepetidas.map(codigo => (
              <button 
                key={`doy-${codigo}`}
                onClick={() => toggleDoy(codigo)}
                style={{
                  background: doy.includes(codigo) ? WC_COLORS.lightBlue : "white",
                  color: doy.includes(codigo) ? "white" : WC_COLORS.darkBlue,
                  border: `1px solid ${WC_COLORS.lightBlue}`,
                  height: "45px", /* ALTURA FIJA */
                  borderRadius: "8px", fontWeight: "bold", cursor: "pointer",
                  fontSize: "clamp(0.7em, 3.2vw, 0.9em)", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {codigo}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA: LO QUE RECIBO */}
        <div style={{ flex: "1 1 300px", background: "rgba(0, 177, 64, 0.1)", padding: "15px", borderRadius: "12px", border: `2px solid ${WC_COLORS.green}` }}>
          <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.green, textAlign: "center", fontSize: "1em" }}>📥 Recibo (Faltantes)</h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)", 
            gap: "8px", 
            maxHeight: "350px", 
            overflowY: "auto", 
            padding: "5px" 
          }}>
            {misFaltantes.map(codigo => (
              <button 
                key={`recibo-${codigo}`}
                onClick={() => toggleRecibo(codigo)}
                style={{
                  background: recibo.includes(codigo) ? WC_COLORS.green : "white",
                  color: recibo.includes(codigo) ? "white" : WC_COLORS.green,
                  border: `1px solid ${WC_COLORS.green}`,
                  height: "45px", /* ALTURA FIJA */
                  borderRadius: "8px", fontWeight: "bold", cursor: "pointer",
                  fontSize: "clamp(0.7em, 3.2vw, 0.9em)", display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {codigo}
              </button>
            ))}
          </div>
        </div>

      </div>

      {(doy.length > 0 || recibo.length > 0) && (
        <div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "15px 25px", borderRadius: "50px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "20px", zIndex: 1000, border: `3px solid ${WC_COLORS.darkBlue}`, width: "90%", maxWidth: "500px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "15px", fontWeight: "bold" }}>
            <span style={{ color: WC_COLORS.lightBlue }}>📤 {doy.length}</span>
            <span style={{ color: WC_COLORS.green }}>📥 {recibo.length}</span>
          </div>
          <button onClick={ejecutarTrueque} style={{ background: WC_COLORS.darkBlue, color: "white", border: "none", padding: "10px 20px", borderRadius: "30px", fontWeight: "900", cursor: "pointer", fontSize: "0.9em" }}>Confirmar Trueque</button>
        </div>
      )}

    </div>
  );
}

export default PvP;