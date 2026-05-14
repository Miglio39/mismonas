// src/PvP.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';
import html2canvas from 'html2canvas';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

const seccionesAlbum = [
  { prefijo: "", nombre: "Especial Panini", bandera: "/logo_panini_especial.png", inicio: 0, fin: 0 },
  { prefijo: "FWC", nombre: "Especiales FIFA", bandera: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_logo_without_slogan.svg", inicio: 1, fin: 20 },
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

function PvP({ usuario }) {
  const [inventario, setInventario] = useState({});
  const [rareza, setRareza] = useState({});
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [listaPegada, setListaPegada] = useState('');
  
  const [doy, setDoy] = useState([]);
  const [recibo, setRecibo] = useState([]);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [matchUid, setMatchUid] = useState(() => new URLSearchParams(window.location.search).get('match'));

  const [pendientes, setPendientes] = useState([]);
  
  // NUEVO ESTADO: Para saber si estamos editando un trueque existente
  const [editandoId, setEditandoId] = useState(null);

  const reciboRef = useRef(null);
  const [generandoImagen, setGenerandoImagen] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      const docRef = doc(db, "inventarios", usuario.uid);
      const docSnap = await getDoc(docRef);
      let miInv = {};
      if (docSnap.exists()) {
        miInv = docSnap.data();
        setInventario(miInv);
      }

      const qPendientes = query(collection(db, "trueques"), where("creador", "==", usuario.uid));
      const snapPendientes = await getDocs(qPendientes);
      const listaPendientes = [];
      snapPendientes.forEach(d => {
        if (d.data().estado === 'pendiente') {
          listaPendientes.push({ id: d.id, ...d.data() });
        }
      });
      setPendientes(listaPendientes);

      if (matchUid && matchUid !== usuario.uid) {
        const otroRef = doc(db, "inventarios", matchUid);
        const otroSnap = await getDoc(otroRef);
        if (otroSnap.exists()) {
          const otroInv = otroSnap.data();
          let autoDoy = [], autoRecibo = [];
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
      }

      const mercado = {};
      seccionesAlbum.forEach(seccion => {
        for (let i = seccion.inicio; i <= seccion.fin; i++) {
          let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
          mercado[codigo] = { oferta: 0, demanda: 0, codigo };
        }
      });

      const mercadoRef = doc(db, 'estadisticas', 'mercado_global');
      const adminSnap = await getDoc(mercadoRef);
      if (adminSnap.exists()) {
        const dataAdmin = adminSnap.data();
        Object.entries(dataAdmin.faltantes || {}).forEach(([codigo, cant]) => { if (mercado[codigo]) mercado[codigo].demanda += cant; });
        Object.entries(dataAdmin.repetidas || {}).forEach(([codigo, cant]) => { if (mercado[codigo]) mercado[codigo].oferta += cant; });
      }

      const inventariosRef = collection(db, "inventarios");
      const usuariosSnap = await getDocs(inventariosRef);
      usuariosSnap.forEach(docUsuario => {
        const inv = docUsuario.data();
        Object.keys(mercado).forEach(codigo => {
          const cant = inv[codigo] || 0;
          if (cant === 0) mercado[codigo].demanda += 1;
          else if (cant > 1) mercado[codigo].oferta += (cant - 1);
        });
      });

      const arregloRareza = Object.values(mercado).map(item => ({ ...item, balance: item.oferta - item.demanda }));
      arregloRareza.sort((a, b) => a.balance - b.balance);

      const mapaRareza = {};
      arregloRareza.forEach((item, index) => {
        mapaRareza[item.codigo] = index + 1;
      });
      setRareza(mapaRareza);
      
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

  const procesarListaPegada = () => {
    if (!listaPegada.trim()) {
      alert("Atencion: Pega una lista de WhatsApp primero.");
      return;
    }

    const texto = listaPegada.toUpperCase();
    let textoRepetidasOtro = "";
    let textoFaltantesOtro = "";

    if (texto.includes("TENGO REPETIDAS") || texto.includes("REPETIDAS")) {
        const matchRep = texto.match(/(?:TENGO REPETIDAS|REPETIDAS).*?(?=ME FALTAN|FALTANTES|$)/s);
        if (matchRep) textoRepetidasOtro = matchRep[0];
    }
    if (texto.includes("ME FALTAN") || texto.includes("FALTANTES")) {
        const matchFal = texto.match(/(?:ME FALTAN|FALTANTES).*?(?=TENGO REPETIDAS|REPETIDAS|$)/s);
        if (matchFal) textoFaltantesOtro = matchFal[0];
    }

    const codigosEnTexto = (txt) => {
        let codigosExtraidos = [];
        const lineas = txt.split('\n');
        const prefijosValidos = seccionesAlbum.map(s => s.prefijo).filter(p => p !== "");

        lineas.forEach(linea => {
            const prefijoLinea = prefijosValidos.find(p => linea.includes(p));
            if (prefijoLinea) {
                const numeros = linea.match(/\b\d+\b/g);
                if (numeros) {
                    numeros.forEach(num => codigosExtraidos.push(`${prefijoLinea}${num}`));
                }
            } else {
                const tradicionales = linea.match(/[A-Z]+[0-9]+/g);
                if (tradicionales) codigosExtraidos.push(...tradicionales);
                if (linea.includes("00") && !linea.match(/[A-Z]+00/)) {
                    codigosExtraidos.push("00");
                }
            }
        });
        return [...new Set(codigosExtraidos)]; 
    };

    const repetidasOtro = codigosEnTexto(textoRepetidasOtro);
    const faltantesOtro = codigosEnTexto(textoFaltantesOtro);

    let autoDoy = [];
    let autoRecibo = [];

    faltantesOtro.forEach(codigo => {
        if (inventario[codigo] > 1) autoDoy.push(codigo);
    });

    repetidasOtro.forEach(codigo => {
        if (inventario[codigo] === 0) autoRecibo.push(codigo);
    });

    if (autoDoy.length === 0 && autoRecibo.length === 0) {
        alert("No encontramos ningun match. Sus faltantes o repetidas no coinciden con las tuyas.");
    } else {
        setDoy(autoDoy);
        setRecibo(autoRecibo);
        setListaPegada('');
        alert(`Match encontrado! Entregas ${autoDoy.length} y recibes ${autoRecibo.length}.`);
    }
  };

  const toggleDoy = (codigo) => {
    if (doy.includes(codigo)) setDoy(doy.filter(c => c !== codigo));
    else setDoy([...doy, codigo]);
  };

  const toggleRecibo = (codigo) => {
    if (recibo.includes(codigo)) setRecibo(recibo.filter(c => c !== codigo));
    else setRecibo([...recibo, codigo]);
  };

  const getEstiloRareza = (codigo, isSelected) => {
    const rank = rareza[codigo] || 999;
    let bgColor = "#ffffff";
    let textColor = WC_COLORS.darkBlue;

    if (rank <= 30) { bgColor = "#7f1d1d"; textColor = "white"; }
    else if (rank <= 100) { bgColor = WC_COLORS.red; textColor = "white"; }
    else if (rank <= 250) { bgColor = "#f97316"; textColor = "white"; }
    else if (rank <= 450) { bgColor = "#facc15"; textColor = WC_COLORS.darkBlue; }
    else { bgColor = WC_COLORS.lime; textColor = WC_COLORS.darkBlue; }

    return {
      background: bgColor,
      color: textColor,
      border: isSelected ? "3px solid #0f172a" : `1px solid ${bgColor}`,
      height: "48px",
      borderRadius: "8px", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "0.2s"
    };
  };

  // NUEVO: Función combinada para guardar uno nuevo o actualizar uno existente
  const guardarOActualizarPendiente = async () => {
    if (doy.length === 0 || recibo.length === 0) { alert("Selecciona al menos una mona para dar y una para recibir."); return; }
    
    setCargando(true);
    try {
      if (editandoId) {
        // ACTUALIZAR EXISTENTE
        await updateDoc(doc(db, "trueques", editandoId), {
          doy: doy,
          recibo: recibo,
          fechaActualizacion: new Date().toISOString()
        });
        
        setPendientes(pendientes.map(p => p.id === editandoId ? { ...p, doy, recibo } : p));
        alert("✅ Propuesta de trueque actualizada.");
      } else {
        // CREAR NUEVO
        const nuevoTrueque = {
          creador: usuario.uid,
          matchUid: matchUid || null,
          doy: doy,
          recibo: recibo,
          estado: "pendiente",
          fecha: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, "trueques"), nuevoTrueque);
        setPendientes([...pendientes, { id: docRef.id, ...nuevoTrueque }]);
        
        if (matchUid) {
          window.history.replaceState(null, '', window.location.pathname);
          setMatchUid(null);
        }
        alert("⏳ Trueque guardado en Pendientes.");
      }

      // Limpiar mesa de trabajo
      setDoy([]);
      setRecibo([]);
      setBusqueda('');
      setEditandoId(null);
      
    } catch (error) {
      console.error(error);
      alert("Error al guardar/actualizar el trueque.");
    }
    setCargando(false);
  };

  const confirmarTruequePendiente = async (trueque) => {
    const confirmacion = window.confirm(`¿Confirmas que ya intercambiaste estas monas físicamente y deseas descontarlas de tu inventario?`);
    if (!confirmacion) return;

    setCargando(true);
    const nuevoInventario = { ...inventario };
    const actualizaciones = {};

    trueque.doy.forEach(codigo => {
      nuevoInventario[codigo] = (nuevoInventario[codigo] || 0) - 1;
      actualizaciones[codigo] = nuevoInventario[codigo];
    });

    trueque.recibo.forEach(codigo => {
      nuevoInventario[codigo] = (nuevoInventario[codigo] || 0) + 1;
      actualizaciones[codigo] = nuevoInventario[codigo];
    });

    try {
      const docRef = doc(db, "inventarios", usuario.uid);
      await updateDoc(docRef, actualizaciones);

      if (trueque.matchUid) {
        try {
          const otroRef = doc(db, "inventarios", trueque.matchUid);
          const otroSnap = await getDoc(otroRef);
          if (otroSnap.exists()) {
            let invOtro = otroSnap.data();
            let actualizacionesOtro = {};
            trueque.doy.forEach(codigo => { actualizacionesOtro[codigo] = (invOtro[codigo] || 0) + 1; });
            trueque.recibo.forEach(codigo => { actualizacionesOtro[codigo] = Math.max(0, (invOtro[codigo] || 0) - 1); });
            await updateDoc(otroRef, actualizacionesOtro);
          }
        } catch (e) { console.warn("No se pudo actualizar el album del otro usuario."); }
      }

      await updateDoc(doc(db, "trueques", trueque.id), { estado: "completado" });

      setInventario(nuevoInventario);
      setPendientes(pendientes.filter(p => p.id !== trueque.id));
      alert("✅ ¡Inventarios actualizados con éxito!");
    } catch (error) {
      console.error(error);
      alert("Error al confirmar el trueque.");
    }
    setCargando(false);
  };

  const cancelarPendiente = async (id) => {
    if(!window.confirm("¿Deseas eliminar esta propuesta pendiente?")) return;
    setCargando(true);
    try {
      await updateDoc(doc(db, "trueques", id), { estado: "cancelado" });
      setPendientes(pendientes.filter(p => p.id !== id));
      if (editandoId === id) {
        setEditandoId(null);
        setDoy([]);
        setRecibo([]);
      }
    } catch (e) {
      console.error(e);
    }
    setCargando(false);
  };

  // NUEVO: Función para cargar los datos del trueque a editar a la mesa de trabajo
  const editarPendiente = (trueque) => {
    setDoy([...trueque.doy]);
    setRecibo([...trueque.recibo]);
    setEditandoId(trueque.id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // NUEVO: Función para cancelar la edición sin guardar
  const cancelarEdicion = () => {
    setDoy([]);
    setRecibo([]);
    setEditandoId(null);
  };

  const ejecutarTruequeInmediato = async () => {
    if (doy.length === 0 || recibo.length === 0) { alert("Selecciona al menos una mona para dar y una para recibir."); return; }
    const confirmacion = window.confirm(`Confirmas el trueque inmediato?\n\nEntregas: ${doy.join(", ")}\nRecibes: ${recibo.join(", ")}`);
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
        } catch (e) { console.warn("No se pudo actualizar el album del otro usuario."); }
        window.history.replaceState(null, '', window.location.pathname);
        setMatchUid(null);
      }

      setInventario(nuevoInventario);
      setDoy([]);
      setRecibo([]);
      setBusqueda('');
      setEditandoId(null);
      alert("Trueque exitoso! Inventarios actualizados.");
    } catch (error) {
      console.error(error);
      alert("Error al guardar el trueque.");
    }
    setCargando(false);
  };

  const descargarResumen = async () => {
    if (!reciboRef.current) return;
    setGenerandoImagen(true);
    try {
      const canvas = await html2canvas(reciboRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Propuesta_Trueque_MisMonas.png`;
      link.click();
    } catch (error) {
      console.error("Error generando la imagen", error);
      alert("Ocurrio un error al generar la imagen.");
    }
    setGenerandoImagen(false);
  };

  if (cargando) return <div style={{ textAlign: "center", marginTop: "50px", color: WC_COLORS.darkBlue }}>Analizando mercado y rarezas...</div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "800px", margin: "auto", padding: "10px", paddingBottom: "100px" }}>
      
      {/* TICKET OCULTO */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={reciboRef} style={{ width: "450px", background: `linear-gradient(135deg, ${WC_COLORS.darkBlue}, #001233)`, color: "white", padding: "30px", borderRadius: "20px", fontFamily: "'Inter', sans-serif" }}>
          
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: "0", fontSize: "2.5em", fontWeight: "900", letterSpacing: "-1px" }}>
              Mis<span style={{ color: WC_COLORS.lime }}>Monas</span>
            </h2>
            <p style={{ margin: "5px 0 0 0", fontSize: "1.1em", color: WC_COLORS.lightBlue, textTransform: "uppercase", fontWeight: "bold" }}>Propuesta de Trueque</p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: WC_COLORS.darkBlue, fontSize: "1.2em", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
              Yo Entrego <span style={{ color: WC_COLORS.red }}>({doy.length})</span>
            </h3>
            <p style={{ margin: 0, fontSize: "1.2em", fontWeight: "bold", color: "#334155", wordWrap: "break-word", lineHeight: "1.5" }}>
              {doy.length > 0 ? doy.join(", ") : "Ninguna"}
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 10px 0", color: WC_COLORS.darkBlue, fontSize: "1.2em", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" }}>
              Yo Recibo <span style={{ color: WC_COLORS.green }}>({recibo.length})</span>
            </h3>
            <p style={{ margin: 0, fontSize: "1.2em", fontWeight: "bold", color: "#334155", wordWrap: "break-word", lineHeight: "1.5" }}>
              {recibo.length > 0 ? recibo.join(", ") : "Ninguna"}
            </p>
          </div>

          <div style={{ textAlign: "center", marginTop: "25px", borderTop: "1px dashed rgba(255,255,255,0.3)", paddingTop: "15px" }}>
            <p style={{ margin: "0 0 5px 0", fontSize: "1.2em", fontWeight: "bold", color: WC_COLORS.lime }}>Hagamos el cambio?</p>
            <p style={{ margin: "0 0 5px 0", fontSize: "1em", color: "white", fontWeight: "bold" }}>Gestiona tu album gratis en:</p>
            <p style={{ margin: 0, fontSize: "1.3em", color: WC_COLORS.lightBlue, fontWeight: "900", letterSpacing: "1px" }}>mismonas.online</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "25px" }}>
        <button 
          onClick={() => setMostrarQR(true)}
          style={{ background: WC_COLORS.darkBlue, color: "white", padding: "12px 20px", borderRadius: "30px", border: "none", fontWeight: "900", cursor: "pointer" }}
        >
          Mi QR de Cambio
        </button>
      </div>

      {/* BANDEJA DE TRUEQUES PENDIENTES CON BOTÓN DE EDITAR */}
      {pendientes.length > 0 && (
        <div style={{ background: "white", padding: "15px", borderRadius: "16px", marginBottom: "25px", border: `2px solid ${WC_COLORS.lightBlue}`, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h4 style={{ margin: "0 0 15px 0", color: WC_COLORS.darkBlue, fontSize: "0.95em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
            ⏳ Trueques Pendientes <span style={{background: WC_COLORS.red, color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "0.8em"}}>{pendientes.length}</span>
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
            {pendientes.map(p => (
              <div key={p.id} style={{ background: editandoId === p.id ? "rgba(0, 163, 224, 0.1)" : "#f8fafc", padding: "12px", borderRadius: "10px", border: editandoId === p.id ? `2px solid ${WC_COLORS.lightBlue}` : "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: "0.85em", color: WC_COLORS.darkBlue, marginBottom: "4px" }}><b>📤 Entregas:</b> {p.doy.join(", ")}</div>
                  <div style={{ fontSize: "0.85em", color: WC_COLORS.green }}><b>📥 Recibes:</b> {p.recibo.join(", ")}</div>
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  <button onClick={() => cancelarPendiente(p.id)} style={{ background: "white", color: WC_COLORS.red, border: `1px solid ${WC_COLORS.red}`, padding: "6px 10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8em" }}>Cancelar</button>
                  <button onClick={() => editarPendiente(p)} style={{ background: "white", color: WC_COLORS.lightBlue, border: `1px solid ${WC_COLORS.lightBlue}`, padding: "6px 10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8em" }}>✏️ Editar</button>
                  <button onClick={() => confirmarTruequePendiente(p)} style={{ background: WC_COLORS.green, color: "white", border: "none", padding: "6px 10px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8em", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>✅ Completar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVISO DE EDICIÓN ACTIVA */}
      {editandoId && (
        <div style={{ background: WC_COLORS.lightBlue, color: "white", padding: "15px", borderRadius: "12px", marginBottom: "20px", textAlign: "center", fontWeight: "bold" }}>
          ✏️ Estás editando una propuesta pendiente. Selecciona las monas y guarda los cambios.
        </div>
      )}

      <div style={{ background: "white", padding: "15px", borderRadius: "16px", marginBottom: "25px", border: `2px solid ${WC_COLORS.lime}`, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <h4 style={{ margin: "0 0 10px 0", color: WC_COLORS.darkBlue, fontSize: "0.9em", textTransform: "uppercase" }}>Analisis Rapido de Lista</h4>
        <textarea 
          placeholder="Pega aqui la lista que te enviaron por WhatsApp..."
          value={listaPegada}
          onChange={(e) => setListaPegada(e.target.value)}
          style={{ width: "100%", height: "80px", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "10px", fontSize: "0.9em", resize: "none", marginBottom: "10px", fontFamily: "inherit" }}
        />
        <button 
          onClick={procesarListaPegada}
          style={{ width: "100%", background: WC_COLORS.green, color: "white", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}
        >
          Generar Trueque Automatico
        </button>
      </div>

      <div style={{ background: "white", padding: "10px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", fontSize: "0.7em" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", background: "#7f1d1d", borderRadius: "2px" }}></span> Mitica</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", background: WC_COLORS.red, borderRadius: "2px" }}></span> Escasa</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", background: "#f97316", borderRadius: "2px" }}></span> Buscada</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", background: "#facc15", borderRadius: "2px" }}></span> Normal</div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "10px", height: "10px", background: WC_COLORS.lime, borderRadius: "2px" }}></span> Comun</div>
      </div>

      <input 
        type="text" 
        placeholder="Busqueda manual (ARG, COL...)" 
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value.toUpperCase().trim())}
        style={{ width: "100%", padding: "15px", borderRadius: "12px", border: `2px solid ${WC_COLORS.darkBlue}`, fontSize: "1.1em", boxSizing: "border-box", marginBottom: "20px" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1 1 300px", background: "rgba(0, 163, 224, 0.05)", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.darkBlue, textAlign: "center", fontSize: "0.9em" }}>Tu Entregas</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", maxHeight: "350px", overflowY: "auto" }}>
            {misRepetidas.map(codigo => (
              <button key={`doy-${codigo}`} onClick={() => toggleDoy(codigo)} style={getEstiloRareza(codigo, doy.includes(codigo))}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: "1.1" }}>
                   <span style={{ fontWeight: "900", fontSize: "clamp(0.75em, 3.2vw, 0.95em)" }}>
                     {doy.includes(codigo) ? `✅ ${codigo}` : codigo}
                   </span>
                   <span style={{ fontSize: "0.75em", opacity: 0.85 }}>x{inventario[codigo]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: "1 1 300px", background: "rgba(0, 177, 64, 0.05)", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.green, textAlign: "center", fontSize: "0.9em" }}>Tu Recibes</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", maxHeight: "350px", overflowY: "auto" }}>
            {misFaltantes.map(codigo => (
              <button key={`recibo-${codigo}`} onClick={() => toggleRecibo(codigo)} style={getEstiloRareza(codigo, recibo.includes(codigo))}>
                <span style={{ fontWeight: "900", fontSize: "clamp(0.75em, 3.2vw, 0.95em)" }}>
                  {recibo.includes(codigo) ? `✅ ${codigo}` : codigo}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BARRA FLOTANTE DINÁMICA (CAMBIA SI ESTÁ EDITANDO) */}
      {(doy.length > 0 || recibo.length > 0) && (
        <div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "white", padding: "15px 20px", borderRadius: "50px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "10px", zIndex: 1000, border: editandoId ? `3px solid ${WC_COLORS.lightBlue}` : `3px solid ${WC_COLORS.darkBlue}`, width: "95%", maxWidth: "700px", justifyContent: "space-between", flexWrap: "wrap" }}>
          
          <div style={{ display: "flex", gap: "15px", fontWeight: "bold" }}>
            <span style={{ color: WC_COLORS.lightBlue }}>Doy: {doy.length}</span>
            <span style={{ color: WC_COLORS.green }}>Recibo: {recibo.length}</span>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {!editandoId && (
              <button 
                onClick={descargarResumen} 
                disabled={generandoImagen}
                style={{ background: "#25D366", color: "white", border: "none", padding: "10px 15px", borderRadius: "30px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.9em" }}
              >
                {generandoImagen ? "Cargando..." : "Imagen"}
              </button>
            )}

            {editandoId && (
              <button 
                onClick={cancelarEdicion} 
                style={{ background: "white", color: WC_COLORS.red, border: `1px solid ${WC_COLORS.red}`, padding: "10px 15px", borderRadius: "30px", fontWeight: "900", cursor: "pointer", fontSize: "0.9em" }}
              >
                Cancelar Edición
              </button>
            )}

            <button 
              onClick={guardarOActualizarPendiente} 
              style={{ background: WC_COLORS.darkBlue, color: "white", border: "none", padding: "10px 15px", borderRadius: "30px", fontWeight: "900", cursor: "pointer", fontSize: "0.9em" }}
            >
              {editandoId ? "Actualizar" : "Guardar Pendiente"}
            </button>

            {!editandoId && (
              <button 
                onClick={ejecutarTruequeInmediato} 
                style={{ background: WC_COLORS.green, color: "white", border: "none", padding: "10px 15px", borderRadius: "30px", fontWeight: "900", cursor: "pointer", fontSize: "0.9em" }}
                title="Descontar del inventario inmediatamente"
              >
                ¡Completar Ya!
              </button>
            )}
          </div>

        </div>
      )}

      {mostrarQR && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,32,91,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(5px)" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "24px", textAlign: "center", maxWidth: "320px" }}>
            <h3 style={{ margin: "0 0 5px 0", color: WC_COLORS.darkBlue, fontSize: "1.6em", fontWeight: "900" }}>Mi Codigo QR</h3>
            
            <div style={{ background: "white", padding: "10px", borderRadius: "16px", border: "3px dashed " + WC_COLORS.lightBlue, display: "inline-block", marginBottom: "15px" }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://mismonas.online/?match=${usuario.uid}`} alt="QR" style={{ width: "200px", height: "200px", display: "block" }} />
            </div>
            
            <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "10px", marginBottom: "20px" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "0.85em", color: WC_COLORS.darkBlue, fontWeight: "bold" }}>Descarga la app en:</p>
              <p style={{ margin: 0, fontSize: "1.2em", color: WC_COLORS.green, fontWeight: "900" }}>mismonas.online</p>
            </div>

            <button onClick={() => setMostrarQR(false)} style={{ background: WC_COLORS.red, color: "white", width: "100%", padding: "12px", borderRadius: "10px", border: "none", fontWeight: "900" }}>Cerrar</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default PvP;