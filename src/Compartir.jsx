// src/Compartir.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf'; 

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

const seccionesAlbum = [
  { prefijo: "FWC", nombre: "Especiales FIFA", bandera: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_logo_without_slogan.svg", inicio: 1, fin: 19 },
  { prefijo: "MEX", nombre: "México", bandera: "https://flagcdn.com/w40/mx.png", inicio: 1, fin: 20 },
  { prefijo: "RSA", nombre: "Sudáfrica", bandera: "https://flagcdn.com/w40/za.png", inicio: 1, fin: 20 },
  { prefijo: "KOR", nombre: "Corea Sur", bandera: "https://flagcdn.com/w40/kr.png", inicio: 1, fin: 20 },
  { prefijo: "CZE", nombre: "Rep. Checa", bandera: "https://flagcdn.com/w40/cz.png", inicio: 1, fin: 20 },
  { prefijo: "CAN", nombre: "Canadá", bandera: "https://flagcdn.com/w40/ca.png", inicio: 1, fin: 20 },
  { prefijo: "BIH", nombre: "Bosnia", bandera: "https://flagcdn.com/w40/ba.png", inicio: 1, fin: 20 },
  { prefijo: "QAT", nombre: "Qatar", bandera: "https://flagcdn.com/w40/qa.png", inicio: 1, fin: 20 },
  { prefijo: "SUI", nombre: "Suiza", bandera: "https://flagcdn.com/w40/ch.png", inicio: 1, fin: 20 },
  { prefijo: "BRA", nombre: "Brasil", bandera: "https://flagcdn.com/w40/br.png", inicio: 1, fin: 20 },
  { prefijo: "MAR", nombre: "Marruecos", bandera: "https://flagcdn.com/w40/ma.png", inicio: 1, fin: 20 },
  { prefijo: "HAI", nombre: "Haití", bandera: "https://flagcdn.com/w40/ht.png", inicio: 1, fin: 20 },
  { prefijo: "SCO", nombre: "Escocia", bandera: "https://flagcdn.com/w40/gb-sct.png", inicio: 1, fin: 20 },
  { prefijo: "USA", nombre: "EE.UU.", bandera: "https://flagcdn.com/w40/us.png", inicio: 1, fin: 20 },
  { prefijo: "PAR", nombre: "Paraguay", bandera: "https://flagcdn.com/w40/py.png", inicio: 1, fin: 20 },
  { prefijo: "AUS", nombre: "Australia", bandera: "https://flagcdn.com/w40/au.png", inicio: 1, fin: 20 },
  { prefijo: "TUR", nombre: "Turquía", bandera: "https://flagcdn.com/w40/tr.png", inicio: 1, fin: 20 },
  { prefijo: "GER", nombre: "Alemania", bandera: "https://flagcdn.com/w40/de.png", inicio: 1, fin: 20 },
  { prefijo: "CUW", nombre: "Curazao", bandera: "https://flagcdn.com/w40/cw.png", inicio: 1, fin: 20 },
  { prefijo: "CIV", nombre: "C. Marfil", bandera: "https://flagcdn.com/w40/ci.png", inicio: 1, fin: 20 },
  { prefijo: "ECU", nombre: "Ecuador", bandera: "https://flagcdn.com/w40/ec.png", inicio: 1, fin: 20 },
  { prefijo: "NED", nombre: "Países Bajos", bandera: "https://flagcdn.com/w40/nl.png", inicio: 1, fin: 20 },
  { prefijo: "JPN", nombre: "Japón", bandera: "https://flagcdn.com/w40/jp.png", inicio: 1, fin: 20 },
  { prefijo: "SWE", nombre: "Suecia", bandera: "https://flagcdn.com/w40/se.png", inicio: 1, fin: 20 },
  { prefijo: "TUN", nombre: "Túnez", bandera: "https://flagcdn.com/w40/tn.png", inicio: 1, fin: 20 },
  { prefijo: "BEL", nombre: "Bélgica", bandera: "https://flagcdn.com/w40/be.png", inicio: 1, fin: 20 },
  { prefijo: "EGY", nombre: "Egipto", bandera: "https://flagcdn.com/w40/eg.png", inicio: 1, fin: 20 },
  { prefijo: "IRN", nombre: "Irán", bandera: "https://flagcdn.com/w40/ir.png", inicio: 1, fin: 20 },
  { prefijo: "NZL", nombre: "N. Zelanda", bandera: "https://flagcdn.com/w40/nz.png", inicio: 1, fin: 20 },
  { prefijo: "ESP", nombre: "España", bandera: "https://flagcdn.com/w40/es.png", inicio: 1, fin: 20 },
  { prefijo: "CPV", nombre: "Cabo Verde", bandera: "https://flagcdn.com/w40/cv.png", inicio: 1, fin: 20 },
  { prefijo: "KSA", nombre: "Arabia S.", bandera: "https://flagcdn.com/w40/sa.png", inicio: 1, fin: 20 },
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

function Compartir({ usuario }) {
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [listas, setListas] = useState({ faltan: {}, repetidas: {} });
  const ticketRef = useRef(null);

  useEffect(() => {
    const cargarInventario = async () => {
      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      
      let agrupadoFaltan = {};
      let agrupadoRepetidas = {};

      if (docSnap.exists()) {
        const inv = docSnap.data();
        
        seccionesAlbum.forEach(sec => {
          let faltanPais = [];
          let repetidasPais = [];
          
          for (let i = sec.inicio; i <= sec.fin; i++) {
            let cant = inv[`${sec.prefijo}${i}`] || 0;
            if (cant === 0) faltanPais.push(i);
            if (cant > 1) repetidasPais.push(i);
          }

          if (faltanPais.length > 0) agrupadoFaltan[sec.prefijo] = faltanPais;
          if (repetidasPais.length > 0) agrupadoRepetidas[sec.prefijo] = repetidasPais;
        });
      }
      setListas({ faltan: agrupadoFaltan, repetidas: agrupadoRepetidas });
      setCargando(false);
    };
    cargarInventario();
  }, [usuario]);

  const descargarImagen = async () => {
    if (!ticketRef.current) return;
    setGenerando(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: "#f8fafc", useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Lista_MisMonas_${usuario.email.split('@')[0]}.png`;
      link.click();
    } catch (error) {
      console.error("Error al generar imagen", error);
      alert("Hubo un error al crear la imagen.");
    }
    setGenerando(false);
  };

  const generarPDF = async () => {
    if (!ticketRef.current) return null;
    const canvas = await html2canvas(ticketRef.current, { scale: 1.5, backgroundColor: "#f8fafc", useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.75);
    
    const pdfWidth = canvas.width * 0.5;
    const pdfHeight = canvas.height * 0.5;
    
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [pdfWidth, pdfHeight]
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const descargarPDF = async () => {
    setGenerando(true);
    try {
      const pdf = await generarPDF();
      if(pdf) {
        pdf.save(`Lista_MisMonas_${usuario.email.split('@')[0]}.pdf`);
      }
    } catch (error) {
      console.error("Error al generar PDF", error);
      alert("Hubo un error al crear el PDF.");
    }
    setGenerando(false);
  };

  const compartirDirectoPDF = async () => {
    setGenerando(true);
    try {
      const pdf = await generarPDF();
      if(pdf) {
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], `Lista_MisMonas_${usuario.email.split('@')[0]}.pdf`, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Mi Lista de Intercambio (PDF)',
              text: '¡Mira las monas que me faltan y las que tengo repetidas! 🚀 Pásate a mismonas.online: Migra tu lista, descubre las monas más buscadas y haz trueques con QR. ¡Totalmente gratis! ⚽'
            });
          } catch (error) {
            console.log('El usuario canceló o hubo un error al compartir', error);
          }
        } else {
          alert("Tu navegador no soporta el envío directo de PDFs. Descarga la imagen en su lugar.");
          descargarImagen();
        }
      }
    } catch (error) {
      console.error("Error al preparar el PDF", error);
      alert("Hubo un error al procesar el PDF.");
    }
    setGenerando(false);
  };

  const RenderizarFilas = ({ datos, colorFondo }) => {
    if (Object.keys(datos).length === 0) return <p style={{ textAlign: "center", fontWeight: "bold", color: "#64748b", padding: "10px", fontSize: "clamp(1em, 3vw, 1.2em)" }}>¡Lista vacía!</p>;
    
    return Object.entries(datos).map(([prefijo, numeros]) => {
      const seccion = seccionesAlbum.find(s => s.prefijo === prefijo);
      if (!seccion) return null;
      
      return (
        <div key={prefijo} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", padding: "clamp(8px, 2vw, 15px)", marginBottom: "10px", borderBottom: "2px solid #e2e8f0", background: "white", borderRadius: "10px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <img src={seccion.bandera} alt={seccion.nombre} style={{ width: "clamp(30px, 8vw, 45px)", height: "auto", border: "1px solid #cbd5e1", borderRadius: "4px", objectFit: "cover" }} />
            <span style={{ fontWeight: "900", color: WC_COLORS.darkBlue, minWidth: "50px", textTransform: "uppercase", fontSize: "clamp(1em, 4vw, 1.3em)" }}>{prefijo}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
            {numeros.map(num => (
              <span key={num} style={{ background: colorFondo, color: "#0f172a", padding: "clamp(4px, 1.5vw, 6px) clamp(8px, 2vw, 12px)", borderRadius: "6px", fontSize: "clamp(0.9em, 3vw, 1.25em)", fontWeight: "900", border: "1px solid #94a3b8" }}>
                {num}
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  if (cargando) return <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2em", fontWeight: "bold", color: WC_COLORS.darkBlue }}>Cargando tus listas...</div>;

  return (
    <div style={{ width: "100%", maxWidth: "900px", margin: "auto", fontFamily: "'Inter', system-ui, sans-serif", padding: "0 10px", boxSizing: "border-box" }}>
      
      {/* BOTONES DE ACCIÓN */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center", marginBottom: "25px" }}>
        <button 
          onClick={compartirDirectoPDF} 
          disabled={generando}
          style={{ background: "#25D366", color: "white", padding: "15px 30px", borderRadius: "30px", border: "none", fontWeight: "900", fontSize: "clamp(0.9em, 3vw, 1.1em)", cursor: "pointer", boxShadow: "0 4px 15px rgba(37, 211, 102, 0.4)", display: "inline-flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "350px", justifyContent: "center" }}
        >
          {generando ? "Creando Documento..." : "📲 Compartir PDF a WhatsApp"}
        </button>

        <button 
          onClick={descargarImagen} 
          disabled={generando}
          style={{ background: WC_COLORS.darkBlue, color: "white", padding: "12px 25px", borderRadius: "30px", border: "none", fontWeight: "bold", fontSize: "clamp(0.8em, 2.5vw, 0.9em)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", width: "100%", maxWidth: "350px", justifyContent: "center" }}
        >
          ⬇️ Descargar Imagen a mi Galería
        </button>
      </div>

      {/* CONTENEDOR 100% RESPONSIVE */}
      <div style={{ paddingBottom: "20px" }}>
        <div 
          ref={ticketRef} 
          style={{ width: "100%", background: "white", padding: "clamp(20px, 4vw, 50px)", borderRadius: "20px", boxSizing: "border-box", border: `4px solid #cbd5e1`, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
        >
          {/* HEADER DEL DOCUMENTO */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px", borderBottom: `5px solid ${WC_COLORS.lime}`, paddingBottom: "20px", marginBottom: "25px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ background: WC_COLORS.darkBlue, color: "white", width: "clamp(40px, 10vw, 60px)", height: "clamp(40px, 10vw, 60px)", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "clamp(1.5em, 5vw, 2.2em)" }}>⚽</div>
                <div>
                  <h2 style={{ margin: "0", fontSize: "clamp(2em, 6vw, 3.2em)", fontWeight: "900", letterSpacing: "-1px", color: WC_COLORS.darkBlue }}>Mis<span style={{ color: WC_COLORS.lime }}>Monas</span></h2>
                  <p style={{ margin: "0", color: "#475569", fontWeight: "900", fontSize: "clamp(0.9em, 3vw, 1.3em)" }}>Colección Oficial 2026</p>
                </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0", fontSize: "clamp(0.8em, 2.5vw, 1.2em)", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "900" }}>Lista de Intercambio</p>
              <h3 style={{ margin: "5px 0 0 0", color: WC_COLORS.darkBlue, fontSize: "clamp(1.2em, 4vw, 1.8em)", fontWeight: "900", wordBreak: "break-all" }}>{usuario.email.split('@')[0]}</h3>
            </div>
          </div>

          {/* TABLA DE FILAS ORDENADAS POR PAÍS */}
          <div style={{ marginBottom: "30px" }}>
              {/* ME FALTAN */}
              <div style={{ background: "#fff1f2", padding: "clamp(10px, 2vw, 15px) clamp(15px, 3vw, 25px)", borderRadius: "12px", marginBottom: "15px" }}>
                  <h3 style={{ margin: "0", color: WC_COLORS.red, fontSize: "clamp(1.2em, 4vw, 1.6em)", fontWeight: "900" }}>❌ ME FALTAN</h3>
              </div>
              <RenderizarFilas datos={listas.faltan} colorFondo="#e2e8f0" />
              
              {/* TENGO REPETIDAS */}
              <div style={{ background: "#f0fdf4", padding: "clamp(10px, 2vw, 15px) clamp(15px, 3vw, 25px)", borderRadius: "12px", marginBottom: "15px", marginTop: "30px" }}>
                  <h3 style={{ margin: "0", color: WC_COLORS.green, fontSize: "clamp(1.2em, 4vw, 1.6em)", fontWeight: "900" }}>✅ TENGO REPETIDAS</h3>
              </div>
              <RenderizarFilas datos={listas.repetidas} colorFondo="#e2e8f0" />
          </div>

          {/* FOOTER PUBLICITARIO */}
          <div style={{ textAlign: "center", marginTop: "40px", paddingTop: "25px", borderTop: "4px dashed #cbd5e1" }}>
             <h4 style={{ margin: "0 0 12px 0", color: WC_COLORS.darkBlue, fontSize: "clamp(1.3em, 4vw, 1.8em)", fontWeight: "900", textTransform: "uppercase" }}>🚀 ¡Pásate a MisMonas.online!</h4>
             <p style={{ margin: "0 0 12px 0", color: "#334155", fontSize: "clamp(1em, 3vw, 1.3em)", fontWeight: "bold" }}>Migra tu lista de Faltantes y Repetidas con 1 clic. Averigua cuáles son las monas más buscadas del mercado y haz trueques con código QR.</p>
             <div style={{ display: "inline-block", background: WC_COLORS.green, color: "white", padding: "8px 25px", borderRadius: "30px", fontWeight: "900", fontSize: "clamp(1em, 3vw, 1.4em)", marginTop: "10px", boxShadow: "0 4px 10px rgba(0, 177, 64, 0.4)" }}>
               ¡TOTALMENTE GRATIS!
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Compartir;