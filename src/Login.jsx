// src/Login.jsx
import { useState } from 'react';
import { auth, db } from './firebase'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore'; 

// Paleta de colores oficial del proyecto
const WC_COLORS = {
  green: "#00B140",
  darkBlue: "#00205B",
  lightBlue: "#00A3E0",
  red: "#E4002B",
  lime: "#97D700",
  white: "#FFFFFF",
  grayBg: "#f8fafc"
};

function Login() {
  // Estados para Auth básica
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Estados para datos de perfil (solo registro)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      if (isRegistering) {
        // 1. Validar campos extra
        if (!nombre || !apellido || !edad || !genero) {
          alert("Por favor, completa todos los campos para registrarte.");
          setCargando(false);
          return;
        }

        // 2. Crear usuario en Firebase Auth
        const credencial = await createUserWithEmailAndPassword(auth, email, password);
        const user = credencial.user;

        // 3. Guardar el perfil en Firestore (Colección 'usuarios')
        await setDoc(doc(db, "usuarios", user.uid), {
          uid: user.uid,
          email: user.email,
          nombre: nombre,
          apellido: apellido,
          edad: Number(edad),
          genero: genero,
          fechaRegistro: new Date()
        });

        alert("¡Cuenta creada con éxito! Bienvenido a MisMonas.");
      } else {
        // Lógica para iniciar sesión
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Hubo un error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // NUEVA FUNCIÓN: Recuperar Contraseña
  const handleRecuperarPassword = async () => {
    if (!email) {
      alert("Por favor, ingresa tu correo electrónico en el campo de arriba para enviarte el enlace de recuperación.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert("¡Enlace enviado! Revisa tu bandeja de entrada (y la carpeta de spam) para restablecer tu contraseña.");
    } catch (error) {
      alert("Error al intentar enviar el correo: " + error.message);
    }
  };

  // Estilos reutilizables para los inputs (CORREGIDO PARA MÓVILES)
  const inputStyle = {
    padding: "14px", 
    borderRadius: "8px", 
    border: `1px solid #cbd5e1`, 
    fontSize: "1em",
    outline: "none",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box", // <--- Esto evita que se desborden
    width: "100%"
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: `linear-gradient(135deg, ${WC_COLORS.darkBlue} 0%, ${WC_COLORS.lightBlue} 100%)`, 
      fontFamily: "'Inter', sans-serif",
      padding: "20px"
    }}>
      
      <div style={{ 
        width: "100%", 
        maxWidth: "450px", 
        background: WC_COLORS.white, 
        borderRadius: "20px", 
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        overflow: "hidden"
      }}>
        
        {/* Cabecera del Login */}
        <div style={{ background: WC_COLORS.white, padding: "30px 20px 15px 20px", textAlign: "center", borderBottom: `4px solid ${WC_COLORS.lime}` }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ background: WC_COLORS.darkBlue, color: "white", width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2em", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
              ⚽
            </div>
            <h1 style={{ margin: 0, fontSize: "2em", fontWeight: "900", letterSpacing: "-1px", color: WC_COLORS.darkBlue }}>
              Mis<span style={{ color: WC_COLORS.green }}>Monas</span>
            </h1>
          </div>
          <p style={{ color: "#64748b", margin: 0, fontSize: "0.9em" }}>
            {isRegistering ? "Únete a la comunidad oficial de coleccionistas" : "Accede a tu inventario mundialista"}
          </p>
        </div>

        {/* Formulario */}
        <div style={{ padding: "30px 20px" }}> {/* Reduje un poco el padding lateral para móviles */}
          <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "15px", width: "100%" }}>
            
            {/* CAMPOS EXTRA (SOLO VISIBLES AL REGISTRARSE) */}
            {isRegistering && (
              <>
                {/* Contenedor Flex con Wrap para Nombre y Apellido */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", width: "100%" }}>
                  <input 
                    type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} 
                    style={{...inputStyle, flex: "1 1 140px"}} required={isRegistering} 
                  />
                  <input 
                    type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} 
                    style={{...inputStyle, flex: "1 1 140px"}} required={isRegistering} 
                  />
                </div>
                
                {/* Contenedor Flex con Wrap para Edad y Género */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", width: "100%" }}>
                  <input 
                    type="number" placeholder="Edad" value={edad} onChange={(e) => setEdad(e.target.value)} 
                    min="1" max="100" style={{...inputStyle, flex: "1 1 100px"}} required={isRegistering} 
                  />
                  <select 
                    value={genero} onChange={(e) => setGenero(e.target.value)} 
                    style={{...inputStyle, flex: "1 1 140px", backgroundColor: "white", color: genero ? "#000" : "#9ca3af"}} required={isRegistering}
                  >
                    <option value="" disabled>Género...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>
              </>
            )}

            {/* CAMPOS BÁSICOS (SIEMPRE VISIBLES) */}
            <input 
              type="email" 
              placeholder="Tu correo electrónico" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={inputStyle}
            />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
              <input 
                type="password" 
                placeholder="Contraseña (mínimo 6 caracteres)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={inputStyle}
              />
              
              {/* ENLACE PARA RECUPERAR CONTRASEÑA (Solo en login) */}
              {!isRegistering && (
                <button 
                  type="button" 
                  onClick={handleRecuperarPassword}
                  style={{ 
                    alignSelf: "flex-end", 
                    background: "none", 
                    border: "none", 
                    color: WC_COLORS.lightBlue, 
                    fontSize: "0.85em", 
                    cursor: "pointer", 
                    padding: "5px 0 0 0",
                    fontWeight: "bold",
                    textDecoration: "underline" 
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button 
              type="submit" 
              disabled={cargando}
              style={{ 
                marginTop: "10px",
                padding: "15px", 
                width: "100%",
                background: isRegistering ? WC_COLORS.green : WC_COLORS.darkBlue, 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: cargando ? "wait" : "pointer", 
                fontWeight: "900",
                fontSize: "1.1em",
                textTransform: "uppercase",
                letterSpacing: "1px",
                boxShadow: `0 4px 15px ${isRegistering ? WC_COLORS.green : WC_COLORS.darkBlue}60`,
                transition: "transform 0.1s ease"
              }}
              onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.target.style.transform = "scale(1)"}
            >
              {cargando ? "Cargando..." : (isRegistering ? "Crear Cuenta" : "Entrar")}
            </button>
          </form>

          {/* TOGGLE ENTRE LOGIN Y REGISTRO */}
          <div style={{ textAlign: "center", marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.9em" }}>
              {isRegistering ? "¿Ya tienes una cuenta?" : "¿Aún no eres parte de MisMonas?"}
            </p>
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setPassword(''); 
              }}
              style={{ 
                background: "none", border: "none", 
                color: WC_COLORS.lightBlue, 
                fontWeight: "bold", 
                fontSize: "1em", 
                cursor: "pointer", 
                marginTop: "5px",
                textDecoration: "underline"
              }}
            >
              {isRegistering ? "Inicia sesión aquí" : "Regístrate gratis"}
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}

export default Login;