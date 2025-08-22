// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "catalogo_peliculas",
  multipleStatements: true,
});

db.connect((err) => {
  if (err) {
    console.error("Error de conexión a MySQL:", err);
    return;
  }
  console.log("Conectado a MySQL 🚀");
});

// Middleware de validación
const validateMovie = (req, res, next) => {
  const {
    titulo,
    año,
    duracion,
    sinopsis,
    calificacion,
    id_genero,
    id_director,
    poster_url,
  } = req.body;

  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return res.status(400).json({ error: "Título inválido" });
  }

  const currentYear = new Date().getFullYear();
  if (!año || isNaN(año) || año < 1888 || año > currentYear + 5) {
    return res.status(400).json({ error: "Año inválido" });
  }

  if (!duracion || isNaN(duracion) || duracion < 1 || duracion > 500) {
    return res.status(400).json({ error: "Duración inválida" });
  }

  if (!calificacion || isNaN(calificacion) || calificacion < 0 || calificacion > 10) {
    return res.status(400).json({ error: "Calificación inválida" });
  }

  if (!id_genero || isNaN(id_genero)) {
    return res.status(400).json({ error: "Género inválido" });
  }

  if (!id_director || isNaN(id_director)) {
    return res.status(400).json({ error: "Director inválido" });
  }

  if (poster_url && typeof poster_url !== 'string') {
    return res.status(400).json({ error: "URL de poster inválida" });
  }

  next();
};

// Obtener todas las películas (vista optimizada)
app.get("/api/peliculas", (req, res) => {
  db.query("SELECT * FROM vista_peliculas ORDER BY titulo", (err, results) => {
    if (err) {
      console.error("Error en consulta de películas:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// Buscar películas con filtros (usa procedimiento almacenado)
app.get("/api/buscar", (req, res) => {
  const { titulo, id_genero, año } = req.query;

  // Validar parámetros
  if (año && (isNaN(año) || año < 1888 || año > new Date().getFullYear() + 5)) {
    return res.status(400).json({ error: "Año de búsqueda inválido" });
  }

  if (id_genero && isNaN(id_genero)) {
    return res.status(400).json({ error: "ID de género inválido" });
  }

  db.query(
    "CALL BuscarPeliculas(?, ?, ?)",
    [titulo || null, id_genero || null, año || null],
    (err, results) => {
      if (err) {
        console.error("Error en búsqueda de películas:", err);
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.json(results[0]);
    }
  );
});

// Insertar nueva película
app.post("/api/peliculas", validateMovie, (req, res) => {
  const {
    titulo,
    año,
    duracion,
    sinopsis,
    calificacion,
    id_genero,
    id_director,
    poster_url,
  } = req.body;

  // Sanitizar datos
  const sanitizedTitulo = mysql.escape(titulo.trim());
  const sanitizedSinopsis = sinopsis ? mysql.escape(sinopsis.trim()) : 'NULL';
  const sanitizedPosterUrl = poster_url ? mysql.escape(poster_url.trim()) : 'NULL';

  db.query(
    "CALL InsertarPelicula(?, ?, ?, ?, ?, ?, ?, ?)",
    [
      titulo.trim(), 
      año, 
      duracion, 
      sinopsis ? sinopsis.trim() : null, 
      calificacion, 
      id_genero, 
      id_director, 
      poster_url ? poster_url.trim() : null
    ],
    (err, results) => {
      if (err) {
        console.error("Error al insertar película:", err);
        
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ error: "Género o director no válido" });
        }
        
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.json({ nuevo_id: results[0][0].nuevo_id });
    }
  );
});

// Actualizar película
app.put("/api/peliculas/:id", validateMovie, (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const {
    titulo,
    año,
    duracion,
    sinopsis,
    calificacion,
    id_genero,
    id_director,
    poster_url,
  } = req.body;

  db.query(
    "CALL ActualizarPelicula(?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id, 
      titulo.trim(), 
      año, 
      duracion, 
      sinopsis ? sinopsis.trim() : null, 
      calificacion, 
      id_genero, 
      id_director, 
      poster_url ? poster_url.trim() : null
    ],
    (err, results) => {
      if (err) {
        console.error("Error al actualizar película:", err);
        
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
          return res.status(400).json({ error: "Género o director no válido" });
        }
        
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      res.json({ filas_afectadas: results[0][0].filas_afectadas });
    }
  );
});

// Eliminar película
app.delete("/api/peliculas/:id", (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  db.query("CALL EliminarPelicula(?)", [id], (err, results) => {
    if (err) {
      console.error("Error al eliminar película:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json({ filas_afectadas: results[0][0].filas_afectadas });
  });
});

// Obtener géneros
app.get("/api/generos", (req, res) => {
  db.query("SELECT * FROM generos ORDER BY nombre", (err, results) => {
    if (err) {
      console.error("Error al obtener géneros:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// Obtener directores
app.get("/api/directores", (req, res) => {
  db.query("SELECT * FROM directores ORDER BY nombre, apellido", (err, results) => {
    if (err) {
      console.error("Error al obtener directores:", err);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    res.json(results);
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});