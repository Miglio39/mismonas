// src/Progreso.jsx
import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

// ORDEN PERSONALIZADO SINCRONIZADO CON FWC CORREGIDO HASTA 19
const seccionesAlbum = [
  { prefijo: "", nombre: "Especial Panini", bandera: "/logo_panini_especial.png", inicio: 0, fin: 0 },
  { prefijo: "FWC", nombre: "Especiales FIFA", bandera: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_logo_without_slogan.svg", inicio: 1, fin: 19 },
  { prefijo: "MEX", nombre: "México", bandera: "https://flagcdn.com/w40/mx.png", inicio: 1, fin: 20 },
  { prefijo: "RSA", nombre: "Sudáfrica", bandera: "https://flagcdn.com/w40/za.png", inicio: 1, fin: 20 },
  { prefijo: "KOR", nombre: "Corea del Sur", bandera: "https://flagcdn.com/w40/kr.png", inicio: 1, fin: 20 },
  { prefijo: "CZE", nombre: "República Checa", bandera: "https://flagcdn.com/w40/cz.png", inicio: 1, fin: 20 },
  { prefijo: "CAN", nombre: "Canadá", bandera: "https://flagcdn.com/w40/ca.png", inicio: 1, fin: 20 },
  { prefijo: "BIH", nombre: "Bosnia y Herzegovina", bandera: "https://flagcdn.com/w40/ba.png", inicio: 1, fin: 20 },
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

const CustomXAxisTick = (props) => {
  const { x, y, payload } = props;
  const seccion = seccionesAlbum.find(s => s.prefijo === payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      {seccion?.bandera && (
        <image href={seccion.bandera} x={-12} y={5} width="24" height="16" />
      )}
      <text x={0} y={35} textAnchor="middle" fill={WC_COLORS.darkBlue} fontSize={11} fontWeight="bold">
        {payload.value}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ background: "white", padding: "15px", border: `2px solid ${WC_COLORS.lime}`, borderRadius: "8px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "8px" }}>
          {data.bandera && <img src={data.bandera} alt="bandera" style={{ width: "24px", borderRadius: "2px" }} />}
          <b style={{ color: WC_COLORS.darkBlue, textTransform: "uppercase" }}>{data.nombre}</b>
        </div>
       
        <p style={{ margin: 0, color: "#475569", fontSize: "0.9em", fontWeight: "bold" }}>
          Llevo: <b style={{ color: WC_COLORS.green }}>{data.obtenidas}</b> de {data.total}
        </p>
        <p style={{ margin: "5px 0 0 0", color: "#475569", fontSize: "0.9em" }}>
          Completado: <b style={{ color: WC_COLORS.lightBlue }}>{Math.round(data.porcentaje)}%</b>
        </p>
      </div>
    );
  }
  return null;
};

function Progreso() {
  const [datosProgreso, setDatosProgreso] = useState([]);
  const [estadisticasGlobales, setEstadisticasGlobales] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const calcularProgreso = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;

      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      const miData = docSnap.exists() ? docSnap.data() : {};

      let faltan = 0;
      let llevo = 0;
      let repetidasTotales = 0;
      let totalAlbum = 0;

      const progresoArray = seccionesAlbum.map(seccion => {
        let obtenidas = 0;
        const total = seccion.fin - seccion.inicio + 1;
        
        for (let i = seccion.inicio; i <= seccion.fin; i++) {
          totalAlbum++;
          
          let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
          let cant = miData[codigo] || 0;
          
          if (cant === 0) {
            faltan++;
          } else {
            llevo++;
            obtenidas++;
            if (cant > 1) {
              repetidasTotales += (cant - 1);
            }
          }
        }
        return { ...seccion, obtenidas, total, porcentaje: (obtenidas / total) * 100 };
      });

      let datosBarras = progresoArray.filter(s => s.prefijo !== "");
      
      // 🚀 ORDENAMIENTO (MAYOR A MENOR) DE IZQUIERDA A DERECHA
      datosBarras.sort((a, b) => {
        // 1. Primero ordena por quien tiene más porcentaje
        if (b.porcentaje !== a.porcentaje) {
          return b.porcentaje - a.porcentaje; 
        }
        // 2. Si tienen el mismo porcentaje, pone primero al que tenga más monas obtenidas
        return b.obtenidas - a.obtenidas;
      });

      setDatosProgreso(datosBarras);
      setEstadisticasGlobales({ faltan, llevo, repetidasTotales, totalAlbum });
      setCargando(false);
    };

    calcularProgreso();
  }, []);

  if (cargando) return (
    <div style={{ textAlign: "center", marginTop: "50px", color: WC_COLORS.darkBlue }}>
      <p style={{ fontWeight: "bold" }}>Dibujando analíticas de progreso...</p>
    </div>
  );

  const anchoGrafico = Math.max(800, datosProgreso.length * 50);

  let porcentaje = 0, conicGradient = "";
  if (estadisticasGlobales) {
    porcentaje = ((estadisticasGlobales.llevo / estadisticasGlobales.totalAlbum) * 100).toFixed(1);
    const pFaltan = (estadisticasGlobales.faltan / estadisticasGlobales.totalAlbum) * 100;
    
    conicGradient = `conic-gradient(
      ${WC_COLORS.red} 0% ${pFaltan}%, 
      ${WC_COLORS.green} ${pFaltan}% 100%
    )`;
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", width: "100%", margin: "auto", padding: "10px", paddingBottom: "50px" }}>
      
      {/* 1. MÓDULO SUPERIOR: PROGRESO GLOBAL (DONA) */}
      {estadisticasGlobales && (
        <div style={{ background: "white", padding: "30px 20px", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: `1px solid ${WC_COLORS.lime}`, marginBottom: "40px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <h2 style={{ margin: "0 0 5px 0", color: WC_COLORS.darkBlue, fontWeight: "900", fontSize: "1.8em" }}>🌟 Progreso Global</h2>
            <p style={{ margin: 0, fontSize: "0.9em", color: "#64748b" }}>Así va tu álbum en general.</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "center", alignItems: "center" }}>
            
            <div style={{
              width: "200px", height: "200px", borderRadius: "50%", background: conicGradient,
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}>
              <div style={{
                width: "140px", 
                height: "140px", background: "white", borderRadius: "50%",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.1)"
              }}>
                <span style={{ fontSize: "2em", fontWeight: "900", color: WC_COLORS.darkBlue }}>{porcentaje}%</span>
             
                <span style={{ fontSize: "0.7em", color: "#64748b", fontWeight: "bold" }}>COMPLETADO</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
              <div style={{ background: "#f8fafc", padding: "10px 15px", borderRadius: "10px", borderLeft: `5px solid ${WC_COLORS.green}` }}>
              
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "bold", color: WC_COLORS.darkBlue, fontSize: "0.9em" }}>🟢 Llevo</span>
                  <span style={{ fontWeight: "900" }}>{estadisticasGlobales.llevo}</span>
                </div>
              </div>
             
              <div style={{ background: "#f8fafc", padding: "10px 15px", borderRadius: "10px", borderLeft: `5px solid ${WC_COLORS.red}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "bold", color: WC_COLORS.darkBlue, fontSize: "0.9em" }}>🔴 Faltan</span>
                  <span style={{ fontWeight: "900" }}>{estadisticasGlobales.faltan}</span>
               
                </div>
              </div>
              <div style={{ background: "#f0f9ff", padding: "10px 15px", borderRadius: "10px", borderLeft: `5px solid ${WC_COLORS.lightBlue}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "bold", color: WC_COLORS.darkBlue, fontSize: "0.9em" }}>🔵 Repetidas</span>
         
                  <span style={{ fontWeight: "900", color: WC_COLORS.lightBlue }}>{estadisticasGlobales.repetidasTotales}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. MÓDULO INFERIOR: RANKING POR PAÍSES (BARRAS) */}
     
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 5px 0", color: WC_COLORS.darkBlue, fontWeight: "900", fontSize: "1.8em" }}>📈 Progreso de Llenado</h2>
        <p style={{ margin: 0, fontSize: "0.9em", color: "#64748b" }}>Desliza hacia la derecha para ver todos los países.</p>
      </div>
      
      <div style={{ 
        background: "white", padding: "20px 0 20px 0", borderRadius: "15px", 
        
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflowX: "auto", 
        scrollbarWidth: "thin", border: `1px solid ${WC_COLORS.lime}`
      }}>
        <div style={{ width: `${anchoGrafico}px`, height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosProgreso} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      
              <XAxis dataKey="prefijo" tick={<CustomXAxisTick />} axisLine={{ stroke: WC_COLORS.darkBlue }} tickLine={false} interval={0} />
              <YAxis domain={[0, 20]} tick={{ fill: WC_COLORS.darkBlue, fontWeight: "bold", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(151, 215, 0, 0.1)' }} />
              <Bar dataKey="obtenidas" radius={[6, 6, 0, 0]} animationDuration={1500} label={{ position: 'top', fill: WC_COLORS.darkBlue, fontSize: 12, fontWeight: '900' }}>
 
                {datosProgreso.map((entry, index) => {
                  let color = WC_COLORS.red;
                  if (entry.porcentaje >= 30) color = WC_COLORS.lime; 
                  if (entry.porcentaje >= 70) color = WC_COLORS.green;
                  if (entry.porcentaje === 100) color = WC_COLORS.lightBlue; 
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default Progreso;