// src/TruequeInteligente.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
// ✨ NUEVO: Importamos setDoc para poder actualizar el inventario
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

// ALGORITMO BÁSICO DE RAREZA
const calcularRareza = (codigo) => {
  const numero = codigo.replace(/[A-Z]/g, '');
  if (codigo === "00" || codigo === "FWC00") return { nivel: 5, color: "#fbbf24", tag: "🔥 SÚPER ÉLITE" };
  if (["ARG10", "POR10", "BRA10", "FRA10", "ENG9"].includes(codigo)) return { nivel: 5, color: "#fbbf24", tag: "⭐ CRACK" };
  if (codigo.startsWith("CC")) return { nivel: 4, color: "#E4002B", tag: "🥤 COCA-COLA" };
  if (codigo.startsWith("FWC")) return { nivel: 4, color: "#9333ea", tag: "💎 FWC" };
  if (numero === "1" && !codigo.startsWith("FWC") && !codigo.startsWith("CC")) return { nivel: 3, color: "#f59e0b", tag: "✨ ESCUDO" };
  return { nivel: 1, color: "#94a3b8", tag: "📄 Normal" };
};

function TruequeInteligente({ usuario }) {
  const [textoLista, setTextoLista] = useState("");
  const [miInventario, setMiInventario] = useState({});
  const [mercadoGlobal, setMercadoGlobal] = useState({}); 
  const [analisis, setAnalisis] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false); // ✨ NUEVO: Estado de carga del inventario
  
  const propuestaRef = useRef(null);

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const docRef = doc(db, "inventarios", usuario.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setMiInventario(docSnap.data());

        const balanceMercado = {};
        
        // Datos Admin
        const mercadoRef = doc(db, 'estadisticas', 'mercado_global');
        const adminSnap = await getDoc(mercadoRef);
        if (adminSnap.exists()) {
          const dataAdmin = adminSnap.data();
          Object.entries(dataAdmin.faltantes || {}).forEach(([cod, cant]) => {
             balanceMercado[cod] = (balanceMercado[cod] || 0) - cant;
          });
          Object.entries(dataAdmin.repetidas || {}).forEach(([cod, cant]) => {
             balanceMercado[cod] = (balanceMercado[cod] || 0) + cant;
          });
        }

        // Datos Usuarios
        const invSnap = await getDocs(collection(db, "inventarios"));
        invSnap.forEach(docUsuario => {
          const inv = docUsuario.data();
          Object.keys(inv).forEach(cod => {
            if (!balanceMercado[cod]) balanceMercado[cod] = 0;
            if (inv[cod] === 0) balanceMercado[cod] -= 1; // Demanda
            else if (inv[cod] > 1) balanceMercado[cod] += (inv[cod] - 1); // Oferta
          });
        });

        setMercadoGlobal(balanceMercado);
      } catch (error) {
        console.error("Error cargando mercado:", error);
      }
      setCargando(false);
    };
    inicializarDatos();
  }, [usuario]);

  const analizarTrueque = () => {
    if (!textoLista.trim()) {
      alert("Pega la lista del otro usuario primero.");
      return;
    }

    const txt = textoLista.toUpperCase();
    
    const extraerCodigos = (bloqueTexto) => {
      let codigos = [];
      const lineas = bloqueTexto.split('\n');
      lineas.forEach(linea => {
        const match = linea.match(/^([A-Z]{2,3}).*?:\s*(.*)$/);
        if (match) {
          const prefijo = match[1];
          const numeros = match[2].match(/\d+/g);
          if (numeros) {
            numeros.forEach(num => {
              let cod = num === "00" ? "00" : `${prefijo}${num}`;
              codigos.push(cod);
            });
          }
        }
      });
      return codigos;
    };

    let idxFaltan = txt.indexOf("ME FALTAN");
    let idxRepetidas = txt.indexOf("REPETIDAS");
    if (idxFaltan === -1) idxFaltan = txt.indexOf("MISSING");
    if (idxRepetidas === -1) idxRepetidas = txt.indexOf("DUPLICATES");

    let txtFaltan = "";
    let txtRepetidas = "";

    if (idxFaltan !== -1 && idxRepetidas !== -1) {
      if (idxFaltan < idxRepetidas) {
        txtFaltan = txt.substring(idxFaltan, idxRepetidas);
        txtRepetidas = txt.substring(idxRepetidas);
      } else {
        txtRepetidas = txt.substring(idxRepetidas, idxFaltan);
        txtFaltan = txt.substring(idxFaltan);
      }
    } else if (idxFaltan !== -1) {
      txtFaltan = txt.substring(idxFaltan);
    } else if (idxRepetidas !== -1) {
      txtRepetidas = txt.substring(idxRepetidas);
    }

    const otroFaltan = extraerCodigos(txtFaltan);
    const otroRepetidas = extraerCodigos(txtRepetidas);

    let darBase = otroFaltan
      .filter(cod => miInventario[cod] && miInventario[cod] > 1)
      .map(cod => ({ codigo: cod, rareza: calcularRareza(cod), balance: mercadoGlobal[cod] || 0 }));

    let pedirBase = otroRepetidas
      .map(cod => ({ 
        codigo: cod, 
        rareza: calcularRareza(cod), 
        balance: mercadoGlobal[cod] || 0, 
        esMiFaltante: !miInventario[cod] || miInventario[cod] === 0 
      }));

    let pedirFinal = [];
    let darFinal = [];
    let tratosExitosos = 0;
    let joyasArrebatadas = 0;

    const niveles = [5, 4, 3, 1]; 

    niveles.forEach(nivel => {
      let misDisponiblesLvl = darBase.filter(m => m.rareza.nivel === nivel);
      let susDisponiblesLvl = pedirBase.filter(m => m.rareza.nivel === nivel);
      
      let matchCount = Math.min(misDisponiblesLvl.length, susDisponiblesLvl.length);
      
      if (matchCount > 0) {
        tratosExitosos += matchCount;

        misDisponiblesLvl.sort((a, b) => b.balance - a.balance);
        darFinal.push(...misDisponiblesLvl.slice(0, matchCount));
        
        susDisponiblesLvl.sort((a, b) => {
          if (a.esMiFaltante && !b.esMiFaltante) return -1;
          if (!a.esMiFaltante && b.esMiFaltante) return 1;
          return a.balance - b.balance; 
        });

        const seleccion = susDisponiblesLvl.slice(0, matchCount);
        joyasArrebatadas += seleccion.filter(m => !m.esMiFaltante).length;
        pedirFinal.push(...seleccion);
      }
    });

    let msjAdmin = "";
    if (tratosExitosos === 0) {
      msjAdmin = "No hay trato posible. O no tienes nada, o las rarezas no cuadran.";
    } else if (joyasArrebatadas > 0) {
      msjAdmin = `🦈 MODO LOBO EQUITATIVO: Trato ${tratosExitosos}x${tratosExitosos}. Todo se igualó categoría x categoría. Añadiste ${joyasArrebatadas} de sus monas MÁS BUSCADAS para reventa.`;
    } else {
      msjAdmin = `⚖️ TRATO PERFECTO: ${tratosExitosos}x${tratosExitosos} igualando categorías exactas y pidiendo solo faltantes.`;
    }

    pedirFinal.sort((a, b) => b.rareza.nivel - a.rareza.nivel || (a.esMiFaltante ? -1 : 1) || a.balance - b.balance);
    darFinal.sort((a, b) => b.rareza.nivel - a.rareza.nivel || b.balance - a.balance);

    setAnalisis({ pedir: pedirFinal, dar: darFinal, msjAdmin });
  };

  const descargarImagenPropuesta = async () => {
    if (!propuestaRef.current) return;
    setGenerando(true);
    try {
      const canvas = await html2canvas(propuestaRef.current, { scale: 2, backgroundColor: "#f8fafc", useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Propuesta_Maestra_MisMonas.png`;
      link.click();
    } catch (error) {
      console.error("Error al generar imagen", error);
      alert("Hubo un error al crear la imagen de propuesta.");
    }
    setGenerando(false);
  };

  // ✨ NUEVO: Función para consolidar el trato y actualizar Base de Datos
  const confirmarTrueque = async () => {
    if (!confirm("¿Ya cerraste el trato con el coleccionista?\n\nAl confirmar, el sistema restará automáticamente las monas que diste y sumará las que recibiste en tu álbum.")) return;

    setActualizando(true);
    try {
      let invActualizado = { ...miInventario };

      // 1. Restamos las monas que acabo de entregar
      analisis.dar.forEach(mona => {
        if (invActualizado[mona.codigo] > 0) {
          invActualizado[mona.codigo] -= 1;
        }
      });

      // 2. Sumamos las monas que acabo de recibir
      analisis.pedir.forEach(mona => {
        invActualizado[mona.codigo] = (invActualizado[mona.codigo] || 0) + 1;
      });

      // 3. Subimos el nuevo álbum a Firebase
      await setDoc(doc(db, "inventarios", usuario.uid), invActualizado);
      
      // 4. Actualizamos el estado local
      setMiInventario(invActualizado);
      alert("¡Inventario actualizado con éxito! 🎉 Se han sumado tus nuevas monas.");
      
      // 5. Limpiamos la pantalla de radar
      setAnalisis(null);
      setTextoLista("");
    } catch (error) {
      console.error("Error actualizando inventario:", error);
      alert("Hubo un problema actualizando tu inventario.");
    }
    setActualizando(false);
  };

  const TarjetaMonaSecreta = ({ item, esPeticion }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "10px 15px", borderRadius: "8px", marginBottom: "8px", border: `1px solid ${item.rareza.color}50`, borderLeft: `5px solid ${item.rareza.color}`, boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontWeight: "900", color: WC_COLORS.darkBlue, fontSize: "1.1em", display: "block" }}>{item.codigo}</span>
          {esPeticion && !item.esMiFaltante && (
             <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.7em", fontWeight: "900", padding: "2px 6px", borderRadius: "4px" }}>🔄 COMERCIO</span>
          )}
        </div>
        <span style={{ fontSize: "0.75em", fontWeight: "bold", color: item.balance <= 0 ? WC_COLORS.red : "#64748b" }}>
          📈 Mercado: {item.balance <= 0 ? `Escasa (${item.balance})` : `Abundante (+${item.balance})`}
        </span>
      </div>
      <span style={{ background: `${item.rareza.color}20`, color: item.rareza.color, padding: "4px 8px", borderRadius: "5px", fontSize: "0.8em", fontWeight: "900", textAlign: "right" }}>{item.rareza.tag}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: "900px", margin: "auto", fontFamily: "'Inter', sans-serif", padding: "20px" }}>
      
      <div style={{ background: WC_COLORS.darkBlue, padding: "30px", borderRadius: "20px", color: "white", marginBottom: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", position: "relative", overflow: "hidden" }}>
        
        {cargando && (
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,32,91,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
             <span style={{ fontWeight: "bold", color: WC_COLORS.lime }}>Sincronizando Mercado Global... 🔄</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
          <span style={{ fontSize: "2.5em" }}>🦈</span>
          <div>
            <h2 style={{ margin: "0", color: WC_COLORS.lime, fontSize: "2em", fontWeight: "900" }}>Lobo Equitativo</h2>
            <p style={{ margin: "5px 0 0 0", color: "#cbd5e1" }}>Iguala escudo x escudo, jugador x jugador, y exprime las más escasas del mercado.</p>
          </div>
        </div>

        <textarea 
          placeholder="Pega aquí la lista de 'Me faltan' y 'Repetidas' del otro usuario..."
          value={textoLista}
          onChange={(e) => setTextoLista(e.target.value)}
          style={{ width: "100%", height: "150px", borderRadius: "10px", padding: "15px", fontSize: "0.95em", border: "none", boxSizing: "border-box", marginBottom: "15px", background: "#f8fafc", color: WC_COLORS.darkBlue, outline: "none" }}
        />

        <button 
          onClick={analizarTrueque}
          disabled={cargando}
          style={{ width: "100%", background: WC_COLORS.lime, color: WC_COLORS.darkBlue, padding: "15px", borderRadius: "10px", border: "none", fontWeight: "900", fontSize: "1.1em", cursor: "pointer", transition: "transform 0.1s" }}
        >
          🔍 Generar Trato Maestro
        </button>
      </div>

      {analisis && (
        <>
          {analisis.msjAdmin && (
             <div style={{ background: "#e0f2fe", borderLeft: `5px solid ${WC_COLORS.lightBlue}`, padding: "15px", borderRadius: "8px", marginBottom: "25px", color: "#0369a1", fontWeight: "bold" }}>
               💡 {analisis.msjAdmin}
             </div>
          )}

          {/* ✨ NUEVO: CAJA CON LOS DOS BOTONES JUNTOS */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", marginBottom: "30px" }}>
            <button 
              onClick={descargarImagenPropuesta} 
              disabled={generando || analisis.dar.length === 0}
              style={{ background: "#25D366", color: "white", padding: "15px 25px", borderRadius: "30px", border: "none", fontWeight: "900", fontSize: "1em", cursor: "pointer", boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {generando ? "Creando Propuesta..." : "📸 Descargar Propuesta"}
            </button>

            <button 
              onClick={confirmarTrueque} 
              disabled={actualizando || analisis.dar.length === 0}
              style={{ background: WC_COLORS.darkBlue, color: "white", padding: "15px 25px", borderRadius: "30px", border: "none", fontWeight: "900", fontSize: "1em", cursor: "pointer", boxShadow: "0 4px 15px rgba(0, 32, 91, 0.3)", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {actualizando ? "Actualizando Base de Datos..." : "✅ ¡Trato Cerrado! Actualizar Álbum"}
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            
            <div style={{ flex: "1 1 300px", background: "#f0fdf4", padding: "20px", borderRadius: "15px", border: `2px solid ${WC_COLORS.green}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                 <h3 style={{ margin: "0", color: WC_COLORS.green, fontSize: "1.3em", fontWeight: "900" }}>📥 PÍDELE ESTAS</h3>
                 <span style={{ background: WC_COLORS.green, color: "white", padding: "4px 10px", borderRadius: "20px", fontWeight: "900" }}>{analisis.pedir.length}</span>
              </div>
              
              {analisis.pedir.length > 0 ? (
                analisis.pedir.map((item, i) => <TarjetaMonaSecreta key={i} item={item} esPeticion={true} />)
              ) : (
                <p style={{ fontWeight: "bold", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No hay nada útil.</p>
              )}
            </div>

            <div style={{ flex: "1 1 300px", background: "#fff1f2", padding: "20px", borderRadius: "15px", border: `2px solid ${WC_COLORS.red}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                 <h3 style={{ margin: "0", color: WC_COLORS.red, fontSize: "1.3em", fontWeight: "900" }}>📤 DALE ESTAS</h3>
                 <span style={{ background: WC_COLORS.red, color: "white", padding: "4px 10px", borderRadius: "20px", fontWeight: "900" }}>{analisis.dar.length}</span>
              </div>

              {analisis.dar.length > 0 ? (
                analisis.dar.map((item, i) => <TarjetaMonaSecreta key={i} item={item} esPeticion={false} />)
              ) : (
                <p style={{ fontWeight: "bold", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>Trato imposible.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* CONTENEDOR OCULTO: LA IMAGEN DE PROPUESTA                 */}
      {/* ========================================================= */}
      {analisis && (
        <div style={{ position: "fixed", top: "-20000px", left: "-20000px", zIndex: -9999 }}>
          <div 
            ref={propuestaRef} 
            style={{ width: "900px", minWidth: "900px", background: "white", padding: "40px", boxSizing: "border-box", border: `6px solid ${WC_COLORS.darkBlue}`, borderRadius: "20px" }}
          >
            <div style={{ textAlign: "center", borderBottom: `4px solid ${WC_COLORS.lime}`, paddingBottom: "20px", marginBottom: "30px" }}>
              <div style={{ fontSize: "4em", marginBottom: "10px" }}>🤝</div>
              <h2 style={{ margin: "0", fontSize: "2.8em", fontWeight: "900", color: WC_COLORS.darkBlue, textTransform: "uppercase" }}>¡Hagamos un Trato!</h2>
              <p style={{ margin: "10px 0 0 0", color: "#64748b", fontWeight: "bold", fontSize: "1.4em" }}>
                Trueque Equitativo <span style={{ color: WC_COLORS.green }}>{analisis.dar.length} x {analisis.pedir.length}</span> • Categoría x Categoría
              </p>
            </div>

            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start", minHeight: "200px" }}>
                
                <div style={{ flex: 1, background: "#f8fafc", padding: "25px", borderRadius: "15px", border: "2px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px 0", color: WC_COLORS.darkBlue, fontSize: "1.8em", fontWeight: "900", textAlign: "center" }}>🎁 YO TE DOY</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                    {analisis.dar.length > 0 ? (
                      analisis.dar.map((item, i) => (
                        <span key={i} style={{ background: "white", color: WC_COLORS.darkBlue, padding: "10px 18px", borderRadius: "10px", fontSize: "1.4em", fontWeight: "900", border: "2px solid #cbd5e1" }}>
                          {item.codigo}
                        </span>
                      ))
                    ) : (
                      <p style={{ color: "#94a3b8", fontWeight: "bold", fontSize: "1.2em" }}>No aplica.</p>
                    )}
                  </div>
                </div>
                
                <div style={{ flex: 1, background: "#f8fafc", padding: "25px", borderRadius: "15px", border: "2px solid #e2e8f0" }}>
                  <h3 style={{ margin: "0 0 20px 0", color: WC_COLORS.darkBlue, fontSize: "1.8em", fontWeight: "900", textAlign: "center" }}>🔄 TÚ ME DAS</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                    {analisis.pedir.length > 0 ? (
                      analisis.pedir.map((item, i) => (
                        <span key={i} style={{ background: "white", color: WC_COLORS.darkBlue, padding: "10px 18px", borderRadius: "10px", fontSize: "1.4em", fontWeight: "900", border: "2px solid #cbd5e1" }}>
                          {item.codigo}
                        </span>
                      ))
                    ) : (
                      <p style={{ color: "#94a3b8", fontWeight: "bold", fontSize: "1.2em" }}>No aplica.</p>
                    )}
                  </div>
                </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "35px", paddingTop: "25px", borderTop: "2px dashed #cbd5e1" }}>
               <h4 style={{ margin: "0 0 5px 0", color: WC_COLORS.darkBlue, fontSize: "1.5em", fontWeight: "900" }}>⚽ Revisado por {usuario.email.split('@')[0]}</h4>
               <p style={{ margin: "0", color: "#94a3b8", fontSize: "1.2em", fontWeight: "bold" }}>MisMonas.online</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TruequeInteligente;