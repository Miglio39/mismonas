// src/Estadisticas.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

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

function Estadisticas() {
  const [topAbundantes, setTopAbundantes] = useState([]);
  const [topEscasas, setTopEscasas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const generarEstadisticas = async () => {
      try {
        const conteoGlobal = {};
        seccionesAlbum.forEach(seccion => {
          for (let i = seccion.inicio; i <= seccion.fin; i++) {
            let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
            conteoGlobal[codigo] = { 
              registradas: 0, 
              faltantes: 0,   
              bandera: seccion.bandera, 
              pais: seccion.nombre, 
              codigo 
            };
          }
        });

        const mercadoRef = doc(db, 'estadisticas', 'mercado_global');
        const adminSnap = await getDoc(mercadoRef);
        
        if (adminSnap.exists()) {
          const dataAdmin = adminSnap.data();
          Object.entries(dataAdmin.repetidas || {}).forEach(([codigo, cant]) => {
            if (conteoGlobal[codigo]) conteoGlobal[codigo].registradas += cant;
          });
          Object.entries(dataAdmin.faltantes || {}).forEach(([codigo, cant]) => {
            if (conteoGlobal[codigo]) conteoGlobal[codigo].faltantes += cant;
          });
        }

        const inventariosRef = collection(db, "inventarios");
        const usuariosSnap = await getDocs(inventariosRef);

        usuariosSnap.forEach(docUsuario => {
          const inventario = docUsuario.data();
          Object.keys(conteoGlobal).forEach(codigo => {
            const cantidadUsuario = inventario[codigo] || 0;
            if (cantidadUsuario > 0) {
              conteoGlobal[codigo].registradas += cantidadUsuario;
            } else {
              conteoGlobal[codigo].faltantes += 1;
            }
          });
        });

        const arregloEstadisticas = Object.values(conteoGlobal);

        const abundantesFormateadas = [...arregloEstadisticas]
          .sort((a, b) => b.registradas - a.registradas)
          .slice(0, 10);

        const escasasFormateadas = [...arregloEstadisticas]
          .sort((a, b) => {
            if (a.registradas === b.registradas) {
              return b.faltantes - a.faltantes; 
            }
            return a.registradas - b.registradas;
          })
          .slice(0, 10);

        setTopEscasas(escasasFormateadas);
        setTopAbundantes(abundantesFormateadas);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener estadísticas híbridas:", error);
        setCargando(false);
      }
    };
    generarEstadisticas();
  }, []);

  if (cargando) return (
    <div style={{ textAlign: "center", marginTop: "80px", color: WC_COLORS.darkBlue }}>
      <div style={{ fontSize: "3em", marginBottom: "15px", animation: "spin 2s linear infinite" }}>🔄</div>
      <h3 style={{ margin: 0, fontWeight: "900" }}>Analizando MisMonas...</h3>
      <p style={{ color: "#64748b", fontSize: "0.9em" }}>Sincronizando Usuarios + Listas Admin</p>
    </div>
  );

  const obtenerEtiquetaAbundante = (index) => {
    if (index === 0) return { texto: "Máxima Oferta", color: "#fff", bg: WC_COLORS.green };
    if (index < 3) return { texto: "Alta Circulación", color: WC_COLORS.darkBlue, bg: WC_COLORS.lime };
    return { texto: "Común", color: "#fff", bg: WC_COLORS.lightBlue };
  };

  const obtenerEtiquetaEscasa = (index) => {
    if (index === 0) return { texto: "Diamante", color: "#fff", bg: WC_COLORS.red };
    if (index < 3) return { texto: "Muy Rara", color: "#fff", bg: WC_COLORS.darkBlue };
    return { texto: "Escasa", color: "#fff", bg: WC_COLORS.lightBlue };
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "950px", margin: "auto", padding: "10px" }}>
      
      <div style={{ 
        background: `linear-gradient(135deg, ${WC_COLORS.darkBlue} 0%, ${WC_COLORS.lightBlue} 100%)`, 
        color: "white", padding: "30px", borderRadius: "16px", marginBottom: "35px",
        boxShadow: "0 10px 25px rgba(0, 32, 91, 0.2)", display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px"
      }}>
        <div>
          <h2 style={{ margin: "0 0 5px 0", fontSize: "2em", fontWeight: "900", color: "#fff" }}>Radar MisMonas</h2>
          <p style={{ margin: 0, color: "#fff", fontSize: "0.95em", opacity: 0.9 }}>Descubre las tendencias del mercado global en tiempo real.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.2)", padding: "10px 20px", borderRadius: "30px", border: "1px solid rgba(255,255,255,0.4)" }}>
          <span style={{ width: "10px", height: "10px", background: WC_COLORS.lime, borderRadius: "50%", boxShadow: `0 0 10px ${WC_COLORS.lime}` }}></span>
          <span style={{ fontWeight: "900", color: "#fff", fontSize: "0.85em", textTransform: "uppercase", letterSpacing: "1px" }}>Mercado Activo</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
        
        {/* COLUMNA 1: ESCASAS */}
        <div style={{ flex: "1 1 350px", maxWidth: "100%", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: WC_COLORS.red, color: "white", padding: "10px", borderRadius: "12px", fontSize: "1.3em" }}>💎</div>
            <div>
              <h3 style={{ margin: 0, color: WC_COLORS.red, fontWeight: "900", fontSize: "1.4em" }}>Top 10 Buscadas</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85em" }}>Las que todo el mundo quiere.</p>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden", border: `2px solid ${WC_COLORS.red}` }}>
            {topEscasas.map((mona, index) => {
              const etiqueta = obtenerEtiquetaEscasa(index);
              const esEspecial00 = mona.codigo === "00";
              return (
                <div key={`escasa-${mona.codigo}`} style={{ 
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", 
                  borderBottom: index === 9 ? "none" : "1px solid #f8fafc", gap: "10px",
                  background: esEspecial00 ? "linear-gradient(120deg, #fff 0%, #fef08a 50%, #fff 100%)" : "transparent"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
                    <div style={{ width: "30px", color: index < 3 ? WC_COLORS.red : "#94a3b8", fontWeight: "900", fontSize: "1.3em", flexShrink: 0 }}>#{index + 1}</div>
                    {mona.bandera && (
                      <div style={{ 
                        width: "35px", height: "25px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: esEspecial00 ? "#fff" : "transparent", borderRadius: "4px", padding: esEspecial00 ? "2px" : "0",
                        boxShadow: esEspecial00 ? "0 0 8px rgba(250,204,21,0.6)" : "0 2px 4px rgba(0,0,0,0.1)"
                      }}>
                        <img src={mona.bandera} alt={mona.pais} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: "2px" }} />
                      </div>
                    )}
                    {/* ANCHO MÍNIMO PARA QUE NO SE PISE CON LA ETIQUETA */}
                    <div style={{ fontWeight: "900", color: WC_COLORS.darkBlue, fontSize: "1.1em", minWidth: "80px", flexShrink: 0 }}>{mona.codigo}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ background: etiqueta.bg, color: etiqueta.color, fontSize: "0.75em", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {etiqueta.texto}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 2: ABUNDANTES */}
        <div style={{ flex: "1 1 350px", maxWidth: "100%", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: WC_COLORS.lime, color: WC_COLORS.darkBlue, padding: "10px", borderRadius: "12px", fontSize: "1.3em" }}>🔁</div>
            <div>
              <h3 style={{ margin: 0, color: WC_COLORS.green, fontWeight: "900", fontSize: "1.4em" }}>Top 10 Repetidas</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85em" }}>Las mejores para ofrecer en cambios.</p>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden", border: `2px solid ${WC_COLORS.green}` }}>
            {topAbundantes.map((mona, index) => {
              const etiqueta = obtenerEtiquetaAbundante(index);
              const esEspecial00 = mona.codigo === "00";
              return (
                <div key={`abundante-${mona.codigo}`} style={{ 
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", 
                  borderBottom: index === 9 ? "none" : "1px solid #f8fafc", gap: "10px",
                  background: esEspecial00 ? "linear-gradient(120deg, #fff 0%, #fef08a 50%, #fff 100%)" : "transparent"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", flex: 1 }}>
                    <div style={{ width: "30px", color: index < 3 ? WC_COLORS.green : "#94a3b8", fontWeight: "900", fontSize: "1.3em", flexShrink: 0 }}>#{index + 1}</div>
                    {mona.bandera && (
                      <div style={{ 
                        width: "35px", height: "25px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: esEspecial00 ? "#fff" : "transparent", borderRadius: "4px", padding: esEspecial00 ? "2px" : "0",
                        boxShadow: esEspecial00 ? "0 0 8px rgba(250,204,21,0.6)" : "0 2px 4px rgba(0,0,0,0.1)",
                        filter: esEspecial00 ? "none" : "grayscale(15%)"
                      }}>
                        <img src={mona.bandera} alt={mona.pais} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: "2px" }} />
                      </div>
                    )}
                    {/* ANCHO MÍNIMO PARA QUE NO SE PISE CON LA ETIQUETA */}
                    <div style={{ fontWeight: "900", color: WC_COLORS.darkBlue, fontSize: "1.1em", minWidth: "80px", flexShrink: 0 }}>{mona.codigo}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ background: etiqueta.bg, color: etiqueta.color, fontSize: "0.75em", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                      {etiqueta.texto}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Estadisticas;