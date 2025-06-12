import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, storage } from "./firebase";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import {
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import imageCompression from "browser-image-compression";

export default function Home() {
  const auth = getAuth();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log("No hay datos del usuario");
        }
      } else {
        navigate("/");
      }
    };

    cargarDatos();
  }, [user, navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const cambiarFotoPerfil = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressed = await imageCompression(file, options);

      const fotoRef = ref(storage, `fotos_perfil/${user.uid}`);

      await deleteObject(fotoRef).catch(() =>
        console.log("No había foto anterior o ya fue eliminada.")
      );

      await uploadBytes(fotoRef, compressed);
      const nuevaURL = await getDownloadURL(fotoRef);

      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, { fotoURL: nuevaURL });

      setUserData((prev) => ({ ...prev, fotoURL: nuevaURL }));
      setMessage("Foto de perfil actualizada con éxito.");
      setIsError(false);
    } catch (error) {
      console.error("Error al cambiar la foto:", error);
      setMessage("No se pudo actualizar la foto.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userData) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Bienvenido, {userData.username} 👋</h1>
      <p>Correo: {user.email}</p>
      <p>Edad: {userData.edad} años</p>

      {userData.fotoURL && (
        <img
          src={userData.fotoURL}
          alt="Foto de perfil"
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            marginTop: 10,
            objectFit: "cover",
          }}
        />
      )}

      <div style={{ marginTop: 15 }}>
        <input type="file" accept="image/*" onChange={cambiarFotoPerfil} />
        {loading && (
          <p style={{ color: "#555", marginTop: 10 }}>Cambiando foto...</p>
        )}
      </div>

      {message && (
        <p style={{ color: isError ? "red" : "green", marginTop: 10 }}>
          {message}
        </p>
      )}

      <button
        onClick={handleLogout}
        style={{ marginTop: 20, padding: 10, cursor: "pointer" }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
