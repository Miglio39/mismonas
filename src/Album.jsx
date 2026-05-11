// src/Album.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

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

function Album({ usuario }) {
  const [inventario, setInventario] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    const cargarInventario = async () => {
      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      let dataDB = docSnap.exists() ? docSnap.data() : {};
      let inventarioLimpio = {};
      let necesitaActualizar = false;

      seccionesAlbum.forEach(seccion => {
        for (let i = seccion.inicio; i <= seccion.fin; i++) {
          let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
          if (dataDB[codigo] !== undefined) {
            inventarioLimpio[codigo] = dataDB[codigo];
          } else {
            inventarioLimpio[codigo] = 0;
            necesitaActualizar = true;
          }
        }
      });

      setInventario(inventarioLimpio);
      if (necesitaActualizar) await setDoc(docRef, inventarioLimpio);
      setCargando(false);
    };
    cargarInventario();
  }, [usuario]);

  const modificarCantidad = async (codigo, delta, limpiarBusqueda = false) => {
    const nuevaCantidad = Math.max(0, (inventario[codigo] || 0) + delta);
    const nuevoInventario = { ...inventario, [codigo]: nuevaCantidad };
    setInventario(nuevoInventario);
    if (limpiarBusqueda) setBusqueda('');
    const docRef = doc(db, "inventarios", usuario.uid);
    await updateDoc(docRef, { [codigo]: nuevaCantidad });
    inputRef.current?.focus();
  };

  const reiniciarAlbum = async () => {
    if (window.confirm("⚠️ ¿Estás seguro? Se borrará todo tu progreso.")) {
      const confirmacion = window.prompt("Escribe 'BORRAR' para confirmar:");
      if (confirmacion === "BORRAR") {
        const resetData = {};
        Object.keys(inventario).forEach(key => resetData[key] = 0);
        setInventario(resetData);
        const docRef = doc(db, "inventarios", usuario.uid);
        await setDoc(docRef, resetData);
      }
    }
    inputRef.current?.focus();
  };

  // NUEVA FUNCIÓN: Marcar todas las monas de un equipo como obtenidas (solo las que faltan)
  const llenarEquipo = async (seccion) => {
    if (!window.confirm(`¿Estás seguro de marcar todo el equipo de ${seccion.nombre} como obtenido?`)) return;

    const nuevoInventario = { ...inventario };
    const actualizacionesDB = {};
    let huboCambios = false;

    // Recorremos las monas de esa sección
    for (let i = seccion.inicio; i <= seccion.fin; i++) {
      let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
      
      // Solo actualizamos si el usuario no tenía esta mona
      if ((nuevoInventario[codigo] || 0) === 0) {
        nuevoInventario[codigo] = 1;
        actualizacionesDB[codigo] = 1;
        huboCambios = true;
      }
    }

    // Si hubo cambios, actualizamos el estado y la base de datos en una sola petición
    if (huboCambios) {
      setInventario(nuevoInventario);
      const docRef = doc(db, "inventarios", usuario.uid);
      await updateDoc(docRef, actualizacionesDB);
    }
  };

  // Función original: Generar texto agrupado por país y enviar por WhatsApp
  const compartirWhatsApp = () => {
    let repetidasPorPais = [];
    let faltantesPorPais = [];
    let totalRepetidas = 0;
    let totalFaltantes = 0;

    seccionesAlbum.forEach(seccion => {
      let repetidasSeccion = [];
      let faltantesSeccion = [];

      for (let i = seccion.inicio; i <= seccion.fin; i++) {
        let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
        let cant = inventario[codigo] || 0;
        
        if (cant > 1) {
          repetidasSeccion.push(codigo);
          totalRepetidas++;
        }
        if (cant === 0) {
          faltantesSeccion.push(codigo);
          totalFaltantes++;
        }
      }

      if (repetidasSeccion.length > 0) {
        repetidasPorPais.push(`🔸 *${seccion.nombre}:* ${repetidasSeccion.join(", ")}`);
      }
      
      if (faltantesSeccion.length > 0) {
        faltantesPorPais.push(`🔹 *${seccion.nombre}:* ${faltantesSeccion.join(", ")}`);
      }
    });

    let mensaje = "🏆 *¡Hola! Estoy llenando el álbum oficial del Mundial 2026.*\n\n";

    if (repetidasPorPais.length > 0) {
      mensaje += `*📦 TENGO REPETIDAS (${totalRepetidas}):*\n${repetidasPorPais.join("\n")}\n\n`;
    } else {
      mensaje += `*📦 TENGO REPETIDAS:*\nNinguna por ahora.\n\n`;
    }

    if (faltantesPorPais.length > 0) {
      mensaje += `*💎 ME FALTAN (${totalFaltantes}):*\n${faltantesPorPais.join("\n")}\n\n`;
    } else {
      mensaje += `*💎 ME FALTAN:*\n¡Ya llené el álbum!\n\n`;
    }

    mensaje += "👉 ¿Revisas si tienes alguna que me sirva o si te sirve alguna de las mías? ¡Hagamos trueque! ⚽";

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const manejarKeyDown = (e) => {
    if (e.key === 'Enter' && busqueda.length >= 1) {
        let codigoBuscar = busqueda === "0" ? "00" : busqueda;
        if (inventario[codigoBuscar] !== undefined) {
            modificarCantidad(codigoBuscar, 1, true);
        }
    }
  };

  if (cargando) return <p style={{textAlign: "center", marginTop: "50px"}}>Sincronizando Monas...</p>;

  let faltan = 0, llevo = 0, repetidasTotales = 0;

  seccionesAlbum.forEach(seccion => {
    for (let i = seccion.inicio; i <= seccion.fin; i++) {
      let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
      let cant = inventario[codigo] || 0;
      if (cant === 0) faltan++;
      else {
        llevo++;
        if (cant > 1) repetidasTotales += (cant - 1);
      }
    }
  });

  const estiloPestana = (tipo) => ({
    flex: 1, padding: "10px 5px", cursor: "pointer", border: "none", borderRadius: "8px",
    fontSize: "0.85em", fontWeight: "bold", transition: "0.3s",
    background: filtroEstado === tipo ? WC_COLORS.darkBlue : "#f1f5f9",
    color: filtroEstado === tipo ? "white" : WC_COLORS.darkBlue
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "800px", margin: "auto", padding: "10px" }}>
      
      {/* CABECERA CON BOTÓN DE WHATSAPP Y REINICIAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ margin: 0, color: WC_COLORS.darkBlue, fontSize: "1.4em", fontWeight: "900" }}>Mi Álbum</h3>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={compartirWhatsApp} 
            style={{ 
              background: "#25D366", color: "white", border: "none", borderRadius: "8px", 
              padding: "8px 12px", cursor: "pointer", fontSize: "0.85em", fontWeight: "900", 
              boxShadow: "0 4px 10px rgba(37, 211, 102, 0.3)", display: "flex", alignItems: "center", gap: "5px" 
            }}
          >
            📲 Compartir Lista
          </button>
          
          <button 
            onClick={reiniciarAlbum} 
            style={{ 
              background: "none", border: `1px solid ${WC_COLORS.red}`, color: WC_COLORS.red, 
              borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "0.8em", fontWeight: "bold" 
            }}
          >
            🗑️ Reiniciar
          </button>
        </div>
      </div>

      <div style={{ background: WC_COLORS.darkBlue, color: "white", padding: "20px", borderRadius: "15px", marginBottom: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ textAlign: "center", flex: 1 }}>
             <span style={{ fontSize: "0.8em", opacity: 0.9, letterSpacing: "1px", textTransform: "uppercase" }}>Faltan</span>
             <b style={{ display: "block", fontSize: "2em", color: WC_COLORS.red }}>{faltan}</b>
          </div>
          <div style={{ textAlign: "center", flex: 1, borderLeft: "1px solid rgba(255,255,255,0.1)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
             <span style={{ fontSize: "0.8em", opacity: 0.9, letterSpacing: "1px", textTransform: "uppercase" }}>Llevo</span>
             <b style={{ display: "block", fontSize: "2em", color: WC_COLORS.green }}>{llevo}</b>
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
             <span style={{ fontSize: "0.8em", opacity: 0.9, letterSpacing: "1px", textTransform: "uppercase" }}>Repetidas</span>
             <b style={{ display: "block", fontSize: "2em", color: WC_COLORS.lightBlue }}>{repetidasTotales}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", background: "rgba(255,255,255,0.1)", padding: "5px", borderRadius: "10px" }}>
          <button onClick={() => setFiltroEstado('todas')} style={estiloPestana('todas')}>Ver Todas</button>
          <button onClick={() => setFiltroEstado('faltan')} style={estiloPestana('faltan')}>Faltantes</button>
          <button onClick={() => setFiltroEstado('llevo')} style={estiloPestana('llevo')}>Obtenidas</button>
          <button onClick={() => setFiltroEstado('repetidas')} style={estiloPestana('repetidas')}>Repetidas</button>
        </div>
      </div>

      <div style={{ position: "sticky", top: "10px", zIndex: 100, marginBottom: "25px" }}>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Busca rápido (Ej: ARG10, JOR, RSA...)" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value.toUpperCase().trim())}
          onKeyDown={manejarKeyDown}
          style={{ width: "100%", padding: "15px", borderRadius: "12px", border: `2px solid ${WC_COLORS.darkBlue}`, fontSize: "1.1em", boxSizing: "border-box", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" }}
        />
      </div>

      <div>
        {seccionesAlbum.map(seccion => {
          const monasVisibles = [];
          for (let i = seccion.inicio; i <= seccion.fin; i++) {
            let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
            let cant = inventario[codigo] || 0;
            
            let cumpleFiltro = (filtroEstado === 'todas') ||
                               (filtroEstado === 'faltan' && cant === 0) || 
                               (filtroEstado === 'llevo' && cant >= 1) ||
                               (filtroEstado === 'repetidas' && cant > 1);

            let cumpleBusqueda = codigo.includes(busqueda) || seccion.nombre.toUpperCase().includes(busqueda);
            if (cumpleFiltro && cumpleBusqueda) {
              monasVisibles.push(codigo);
            }
          }

          if (monasVisibles.length === 0) return null;

          return (
            <div key={seccion.nombre} style={{ marginBottom: "20px" }}>
              
              {/* NUEVA CABECERA CON BOTÓN "LLENAR EQUIPO" */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f1f5f9", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "900", color: WC_COLORS.darkBlue, fontSize: "0.9em", textTransform: "uppercase" }}>
                  {seccion.bandera && <img src={seccion.bandera} alt={seccion.nombre} style={{ width: "24px", borderRadius: "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />}
                  {seccion.nombre}
                </div>
                <button
                  onClick={() => llenarEquipo(seccion)}
                  style={{
                    background: WC_COLORS.green, color: "white", border: "none", borderRadius: "6px",
                    padding: "6px 10px", cursor: "pointer", fontSize: "0.75em", fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)", transition: "0.2s"
                  }}
                  title={`Marcar todas las de ${seccion.nombre} como obtenidas`}
                >
                  ✓ Llenar Equipo
                </button>
              </div>
              {/* FIN NUEVA CABECERA */}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))", gap: "10px", padding: "10px 0" }}>
                {monasVisibles.map(codigo => {
                  const cant = inventario[codigo] || 0;
                  return (
                    <div key={codigo} style={{ position: "relative" }}>
                      <div 
                        onClick={() => modificarCantidad(codigo, 1, busqueda !== '')}
                        style={{ 
                          background: cant > 1 ? WC_COLORS.lightBlue : cant === 1 ? WC_COLORS.green : "#ffffff",
                          border: "1px solid #e2e8f0",
                          padding: "12px 5px", textAlign: "center", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", transition: "0.2s",
                          color: cant >= 1 ? "white" : WC_COLORS.darkBlue,
                          opacity: cant === 0 && filtroEstado === 'todas' ? 0.6 : 1,
                          boxShadow: cant >= 1 ? "0 4px 6px rgba(0,0,0,0.1)" : "none"
                        }}
                      >
                        <div style={{ fontSize: "0.95em" }}>{codigo}</div>
                        {cant > 1 && <div style={{ fontSize: "0.75em", color: WC_COLORS.darkBlue, background: "rgba(255,255,255,0.8)", borderRadius: "10px", display: "inline-block", padding: "1px 6px", marginTop: "2px" }}>x{cant}</div>}
                      </div>
                      {cant > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); modificarCantidad(codigo, -1); }}
                          style={{ position: "absolute", top: "-5px", right: "-5px", background: WC_COLORS.red, color: "white", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                        > - </button>
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