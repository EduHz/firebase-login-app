import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSendEmail = async () => {
    if (!email) {
      setMessage("Ingresá tu correo.");
      setIsError(true);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Te enviamos un correo para restablecer tu contraseña.");
      setIsError(false);
    } catch (error) {
      setMessage("No se pudo enviar el correo. Verificá el email.");
      setIsError(true);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Recuperar contraseña</h2>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button onClick={handleSendEmail} style={{ width: "100%", padding: 10 }}>
        Enviar correo de recuperación
      </button>

      {message && (
        <p style={{ color: isError ? "red" : "green", marginTop: 10 }}>{message}</p>
      )}

      <button
        onClick={() => navigate("/")}
        style={{ marginTop: 20, padding: 10 }}
      >
        Volver al inicio
      </button>
    </div>
  );
}
