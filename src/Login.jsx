import React, { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app, db, storage } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [edad, setEdad] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(selectedFile, options);
      setFoto(compressedFile);
      setFotoPreview(URL.createObjectURL(compressedFile));
      setMessage("Imagen comprimida correctamente.");
      setIsError(false);
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      setIsError(true);
      setMessage("No se pudo comprimir la imagen.");
    }
  };

  const handleAuth = async () => {
    setMessage("");
    try {
      if (isRegistering) {
        if (!foto) {
          setIsError(true);
          setMessage("Seleccioná una foto de perfil.");
          return;
        }

        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const storageRef = ref(storage, `fotos_perfil/${userCred.user.uid}`);
        await uploadBytes(storageRef, foto);
        const fotoURL = await getDownloadURL(storageRef);

        await setDoc(doc(db, "usuarios", userCred.user.uid), {
          email,
          username,
          edad: parseInt(edad),
          fotoURL,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/home");
    } catch (err) {
      setIsError(true);
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>{isRegistering ? "Registrarse" : "Iniciar sesión"}</h2>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      {isRegistering && (
        <>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <input
            type="number"
            placeholder="Edad"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: "100%", marginBottom: 10 }}
          />
          {fotoPreview && (
            <img
              src={fotoPreview}
              alt="Vista previa"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                marginBottom: 10,
                objectFit: "cover",
              }}
            />
          )}
        </>
      )}

      <button onClick={handleAuth} style={{ width: "100%", padding: 10 }}>
        {isRegistering ? "Crear cuenta" : "Ingresar"}
      </button>

      <p style={{ marginTop: 10 }}>
        {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setMessage("");
            setFoto(null);
            setFotoPreview(null);
          }}
        >
          {isRegistering ? "Inicia sesión" : "Regístrate"}
        </button>
      </p>

      {!isRegistering && (
        <button
          onClick={() => navigate("/olvide")}
          style={{
            marginTop: 10,
            background: "none",
            border: "none",
            color: "blue",
            cursor: "pointer",
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      )}

      {message && (
        <p style={{ color: isError ? "red" : "green", marginTop: 15 }}>
          {message}
        </p>
      )}
    </div>
  );
}
