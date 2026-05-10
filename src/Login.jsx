// src/Login.jsx
import { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // Lógica para registrar nuevo usuario
        await createUserWithEmailAndPassword(auth, email, password);
        alert("¡Cuenta creada con éxito! Ya estás adentro.");
      } else {
        // Lógica para iniciar sesión
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Hubo un error: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", textAlign: "center", background: "white", borderRadius: "10px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#002b5e" }}>{isRegistering ? "Crear Nueva Cuenta" : "Iniciar Sesión"}</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Para gestionar tu álbum Panini 2026</p>
      
      <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="email" 
          placeholder="Tu correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input 
          type="password" 
          placeholder="Contraseña (mínimo 6 caracteres)" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ padding: "12px", background: "#0284c7", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
          {isRegistering ? "Registrarme" : "Entrar"}
        </button>
      </form>

      <p 
        style={{ marginTop: "20px", cursor: "pointer", color: "#0284c7", textDecoration: "underline" }} 
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
      </p>
    </div>
  );
}

export default Login;