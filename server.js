const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];

  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({
      error: "La clave de administrador no está configurada."
    });
  }

  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      error: "No autorizado."
    });
  }

  next();
}

// Recibir solicitudes de canciones
app.post("/api/requests", async (req, res) => {
  try {
    const { name, song, artist, dedication } = req.body;

    if (!song || !song.trim()) {
      return res.status(400).json({
        error: "Falta el nombre de la canción."
      });
    }

    if (!artist || !artist.trim()) {
      return res.status(400).json({
        error: "Falta el nombre del artista."
      });
    }

    const request = {
      id: Date.now().toString(),
      name: name?.trim() || "Anónimo",
      song: song.trim(),
      artist: artist.trim(),
      dedication: dedication?.trim() || "",
      status: "pendiente",
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("requests")
      .insert([request])
      .select()
      .single();

    if (error) {
      console.error("Error guardando solicitud:", error);

      return res.status(500).json({
        error: "No se pudo guardar la solicitud."
      });
    }

    res.json({
      success: true,
      request: data
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error interno del servidor."
    });
  }
});

// Obtener solicitudes para el administrador
app.get("/api/requests", adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo solicitudes:", error);

      return res.status(500).json({
        error: "No se pudieron obtener las solicitudes."
      });
    }

    res.json(data);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error interno del servidor."
    });
  }
});

// Aprobar o rechazar una solicitud
app.patch("/api/requests/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const { data, error } = await supabase
      .from("requests")
      .update({ status: status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando solicitud:", error);

      return res.status(404).json({
        error: "Solicitud no encontrada."
      });
    }

    res.json({
      success: true,
      request: data
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error interno del servidor."
    });
  }
});

// Eliminar una solicitud
app.delete("/api/requests/:id", adminAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from("requests")
      .delete()
      .eq("id", req.params.id);

    if (error) {
      console.error("Error eliminando solicitud:", error);

      return res.status(500).json({
        error: "No se pudo eliminar la solicitud."
      });
    }

    res.json({
      success: true
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error interno del servidor."
    });
  }
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
