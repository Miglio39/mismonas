// src/Migracion.jsx
import { useState } from 'react';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

// Estructura del álbum para saber qué códigos existen
const seccionesAlbum = [
  { prefijo: "", inicio: 0, fin: 0 },
  { prefijo: "FWC", inicio: 1, fin: 19 },
  { prefijo: "MEX", inicio: 1, fin: 20 }, { prefijo: "RSA", inicio: 1, fin: 20 },
  { prefijo: "KOR", inicio: 1, fin: 20 }, { prefijo: "CZE", inicio: 1, fin: 20 },
  { prefijo: "CAN", inicio: 1, fin: 20 }, { prefijo: "BIH", inicio: 1, fin: 20 },
  { prefijo: "QAT", inicio: 1, fin: 20 }, { prefijo: "SUI", inicio: 1, fin: 20 },
  { prefijo: "BRA", inicio: 1, fin: 20 }, { prefijo: "MAR", inicio: 1, fin: 20 },
  { prefijo: "HAI", inicio: 1, fin: 20 }, { prefijo: "SCO", inicio: 1, fin: 20 },
  { prefijo: "USA", inicio: 1, fin: 20 }, { prefijo: "PAR", inicio: 1, fin: 20 },
  { prefijo: "AUS", inicio: 1, fin: 20 }, { prefijo: "TUR", inicio: 1, fin: 20 },
  { prefijo: "GER", inicio: 1, fin: 20 }, { prefijo: "CUW", inicio: 1, fin: 20 },
  { prefijo: "CIV", inicio: 1, fin: 20 }, { prefijo: "ECU", inicio: 1, fin: 20 },
  { prefijo: "NED", inicio: 1, fin: 20 }, { prefijo: "JPN", inicio: 1, fin: 20 },
  { prefijo: "SWE", inicio: 1, fin: 20 }, { prefijo: "TUN", inicio: 1, fin: 20 },
  { prefijo: "BEL", inicio: 1, fin: 20 }, { prefijo: "EGY", inicio: 1, fin: 20 },
  { prefijo: "IRN", inicio: 1, fin: 20 }, { prefijo: "NZL", inicio: 1, fin: 20 },
  { prefijo: "ESP", inicio: 1, fin: 20 }, { prefijo: "CPV", inicio: 1, fin: 20 },
  { prefijo: "KSA", inicio: 1, fin: 20 }, { prefijo: "URU", inicio: 1, fin: 20 },
  { prefijo: "FRA", inicio: 1, fin: 20 }, { prefijo: "SEN", inicio: 1, fin: 20 },
  { prefijo: "IRQ", inicio: 1, fin: 20 }, { prefijo: "NOR", inicio: 1, fin: 20 },
  { prefijo: "ARG", inicio: 1, fin: 20 }, { prefijo: "ALG", inicio: 1, fin: 20 },
  { prefijo: "AUT", inicio: 1, fin: 20 }, { prefijo: "JOR", inicio: 1, fin: 20 },
  { prefijo: "POR", inicio: 1, fin: 20 }, { prefijo: "COD", inicio: 1, fin: 20 },
  { prefijo: "UZB", inicio: 1, fin: 20 }, { prefijo: "COL", inicio: 1, fin: 20 },
  { prefijo: "ENG", inicio: 1, fin: 20 }, { prefijo: "CRO", inicio: 1, fin: 20 },
  { prefijo: "GHA", inicio: 1, fin: 20 }, { prefijo: "PAN", inicio: 1, fin: 20 },
  { prefijo: "CC", inicio: 1, fin: 14 }
];

function Migracion({ usuario }) {
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);

  const procesarMigracion = async () => {
    if (!texto.toUpperCase().includes("ME FALTAN") && !texto.toUpperCase().includes("REPETIDAS")) {
      alert("❌ El texto no parece ser una lista válida de la otra aplicación. Asegúrate de copiarlo completo.");
      return;
    }

    const confirmacion = window.confirm("⚠️ ADVERTENCIA: Esto sobrescribirá tu inventario actual en MisMonas y armará tu álbum basado en esta lista. ¿Deseas continuar?");
    if (!confirmacion) return;

    setCargando(true);
    try {
      let nuevoInventario = {};

      // 1. Asumimos que el usuario TIENE todo (Cantidad = 1)
      seccionesAlbum.forEach(sec => {
        for (let i = sec.inicio; i <= sec.fin; i++) {
          let cod = sec.prefijo === "" && i === 0 ? "00" : `${sec.prefijo}${i}`;
          nuevoInventario[cod] = 1;
        }
      });

      // 2. Dividir el texto en los dos bloques principales
      const txt = texto.toUpperCase();
      const idxFaltan = txt.indexOf("ME FALTAN");
      const idxRepetidas = txt.indexOf("REPETIDAS");

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

      // Función traductora para extraer los códigos
      const aplicarCantidades = (bloqueTexto, cantidadAsignar) => {
        const lineas = bloqueTexto.split('\n');
        lineas.forEach(linea => {
          linea = linea.trim();
          if (!linea) return;

          // Busca el patrón: 2 o 3 letras, cosas raras (emojis), dos puntos, y luego números
          // Ejemplo: "FWC 🏆: 00, 1, 2" o "CC 🥤: 5"
          const match = linea.match(/^([A-Z]{2,3}).*?:\s*(.*)$/);
          if (match) {
            const prefijo = match[1];
            const numeros = match[2].match(/\d+/g);
            
            if (numeros) {
              numeros.forEach(num => {
                // Controlar el caso especial de "00" (Panini Shield)
                let cod = num === "00" ? "00" : `${prefijo}${num}`;
                nuevoInventario[cod] = cantidadAsignar;
              });
            }
          }
        });
      };

      // 3. Aplicar las faltantes (Cantidad = 0)
      aplicarCantidades(txtFaltan, 0);

      // 4. Aplicar las repetidas (Cantidad = 2)
      aplicarCantidades(txtRepetidas, 2);

      // 5. Inyectar directamente en la base de datos de Firebase
      await setDoc(doc(db, "inventarios", usuario.uid), nuevoInventario);
      
      alert("✅ ¡MIGRACIÓN EXITOSA! Tu álbum ha sido armado automáticamente en MisMonas.");
      setTexto('');

    } catch (error) {
      console.error(error);
      alert("Hubo un error procesando la migración.");
    }
    setCargando(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", borderTop: `5px solid ${WC_COLORS.lightBlue}` }}>
        <h2 style={{ margin: "0 0 10px 0", color: WC_COLORS.darkBlue, display: "flex", alignItems: "center", gap: "10px" }}>
          🚀 Migración Express
        </h2>
        <p style={{ margin: "0 0 20px 0", color: "#64748b", lineHeight: "1.5" }}>
          ¿Vienes de la app <b>Figuritas App</b> u otra similar? No llenes tus monas a mano. 
          Pega aquí el mensaje con tu lista de faltantes y repetidas, y nosotros armaremos tu álbum automáticamente.
        </p>

        <textarea 
          placeholder="Ejemplo:&#10;Me faltan&#10;MEX 🇲🇽: 1, 5&#10;&#10;Repetidas&#10;ARG 🇦🇷: 10..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          style={{ width: "100%", height: "250px", borderRadius: "12px", border: "2px dashed #cbd5e1", padding: "15px", fontSize: "0.95em", resize: "vertical", boxSizing: "border-box", marginBottom: "20px", background: "#f8fafc" }}
        />

        <button 
          onClick={procesarMigracion} 
          disabled={cargando}
          style={{ width: "100%", background: WC_COLORS.darkBlue, color: "white", padding: "15px", borderRadius: "12px", border: "none", fontWeight: "900", fontSize: "1.1em", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", boxShadow: "0 4px 15px rgba(0, 32, 91, 0.3)" }}
        >
          {cargando ? "Armando Álbum Mágicamente..." : "⚡ Procesar y Armar mi Álbum"}
        </button>

        <div style={{ marginTop: "20px", background: "#fffbeb", color: "#b45309", padding: "15px", borderRadius: "10px", fontSize: "0.85em", borderLeft: "4px solid #f59e0b" }}>
          <b>Nota:</b> Esta acción actualizará tu inventario en MisMonas basándose exactamente en la lista. Todo lo que no esté en "Me faltan" se marcará como que ya lo tienes.
        </div>
      </div>
    </div>
  );
}

export default Migracion;