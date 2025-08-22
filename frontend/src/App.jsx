import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const [peliculas, setPeliculas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    titulo: "",
    año: "",
    duracion: "",
    sinopsis: "",
    calificacion: "",
    id_genero: "",
    id_director: "",
    poster_url: "",
  });
  const [filtros, setFiltros] = useState({
    titulo: "",
    id_genero: "",
    año: ""
  });
  const [peliculasFiltradas, setPeliculasFiltradas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // Nuevo estado para controlar la edición

  // 🔹 Estados NUEVOS para comparativa de tecnologías (AGREGADO)
  const [resultadoConsulta, setResultadoConsulta] = useState([]);
  const [tecnologiaActiva, setTecnologiaActiva] = useState("");
  const [infoOpen, setInfoOpen] = useState({
    odbc: false,
    ado: false,
    jdbc: false,
    nest: false,
  });

  const toggleInfo = (key) =>
    setInfoOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [peliculasRes, generosRes, directoresRes] = await Promise.all([
          axios.get("http://localhost:5000/api/peliculas"),
          axios.get("http://localhost:5000/api/generos"),
          axios.get("http://localhost:5000/api/directores")
        ]);
        setPeliculas(peliculasRes.data);
        setGeneros(generosRes.data);
        setDirectores(directoresRes.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtros
  useEffect(() => {
    if (filtros.titulo || filtros.id_genero || filtros.año) {
      const filtered = peliculas.filter(p => {
        return (
          (filtros.titulo === "" || p.titulo.toLowerCase().includes(filtros.titulo.toLowerCase())) &&
          (filtros.id_genero === "" || p.id_genero == filtros.id_genero) &&
          (filtros.año === "" || p.año_lanzamiento == filtros.año)
        );
      });
      setPeliculasFiltradas(filtered);
    } else {
      setPeliculasFiltradas(peliculas);
    }
  }, [filtros, peliculas]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });
  const clearFilters = () => setFiltros({ titulo: "", id_genero: "", año: "" });

  const validateForm = () => {
    if (!form.titulo.trim()) return "El título es obligatorio";
    if (!form.año || form.año < 1888 || form.año > new Date().getFullYear() + 5) return "Año inválido";
    if (!form.duracion || form.duracion < 1 || form.duracion > 500) return "Duración inválida";
    if (!form.calificacion || form.calificacion < 0 || form.calificacion > 10) return "Calificación inválida";
    if (!form.id_genero) return "Seleccione un género";
    if (!form.id_director) return "Seleccione un director";
    return null;
  };

  // Función para cargar datos de película a editar
  const loadMovieToEdit = (pelicula) => {
    setForm({
      titulo: pelicula.titulo,
      año: pelicula.año_lanzamiento,
      duracion: pelicula.duracion_minutos,
      sinopsis: pelicula.sinopsis || "",
      calificacion: pelicula.calificacion,
      id_genero: pelicula.id_genero,
      id_director: pelicula.id_director,
      poster_url: pelicula.poster_url || ""
    });
    setEditingId(pelicula.id_pelicula);
    setShowForm(true);
  };

  // Función para cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      titulo: "",
      año: "",
      duracion: "",
      sinopsis: "",
      calificacion: "",
      id_genero: "",
      id_director: "",
      poster_url: "",
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (editingId) {
        // Modo edición: actualizar película existente
        await axios.put(`http://localhost:5000/api/peliculas/${editingId}`, form);
        setSuccess(`Película "${form.titulo}" actualizada correctamente`);
      } else {
        // Modo creación: agregar nueva película
        const res = await axios.post("http://localhost:5000/api/peliculas", form);
        setSuccess(`Película "${form.titulo}" agregada con ID: ${res.data.nuevo_id}`);
      }
      
      // Limpiar formulario
      setForm({
        titulo: "",
        año: "",
        duracion: "",
        sinopsis: "",
        calificacion: "",
        id_genero: "",
        id_director: "",
        poster_url: "",
      });
      
      // Actualizar lista de películas
      const peliculasRes = await axios.get("http://localhost:5000/api/peliculas");
      setPeliculas(peliculasRes.data);
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titulo) => {
    if (!window.confirm(`¿Desea eliminar "${titulo}"?`)) return;
    setLoading(true);
    setError("");
    try {
      await axios.delete(`http://localhost:5000/api/peliculas/${id}`);
      setSuccess(`Película "${titulo}" eliminada`);
      const peliculasRes = await axios.get("http://localhost:5000/api/peliculas");
      setPeliculas(peliculasRes.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Ejecutar consulta por tecnología (AGREGADO)
  const ejecutarConsulta = async (tipo) => {
    try {
 
      const res = await fetch("http://localhost:5000/api/peliculas");
      const data = await res.json();
      setResultadoConsulta(data);
      setTecnologiaActiva(tipo);
    } catch (err) {
      setError("❌ Error al conectar con el backend de comparativa");
      console.error(err);
    }
  };

  // 🎨 Estilos de la app (tus estilos originales)
  const styles = {
    container: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: "100vw",
      minHeight: "100vh",
      margin: 0,
      padding: "20px",
      backgroundColor: "#1a1a2e",
      color: "#fff",
      boxSizing: "border-box"
    },
    header: {
      textAlign: "center",
      color: "#e94560",
      fontSize: "3rem",
      marginBottom: "30px",
      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
      padding: "20px",
      backgroundColor: "#16213e",
      borderRadius: "10px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
    },
    card: {
      backgroundColor: "#16213e",
      borderRadius: "10px",
      padding: "25px",
      marginBottom: "25px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
    },
    filterSection: {
      backgroundColor: "#0f3460",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      display: "flex",
      flexWrap: "wrap",
      gap: "15px",
      alignItems: "center"
    },
    formSection: {
      backgroundColor: "#0f3460",
      padding: "25px",
      borderRadius: "8px",
      marginBottom: "25px"
    },
    tableContainer: {
      width: "100%",
      overflowX: "auto"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      backgroundColor: "#16213e",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      minWidth: "800px"
    },
    tableHeader: {
      backgroundColor: "#e94560",
      color: "white",
      padding: "15px",
      textAlign: "left",
      fontSize: "1rem"
    },
    tableCell: {
      padding: "15px",
      borderBottom: "1px solid #0f3460",
      verticalAlign: "top"
    },
    button: {
      backgroundColor: "#533483",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "5px",
      cursor: "pointer",
      margin: "5px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
    },
    buttonHover: {
      backgroundColor: "#4a2c7e",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
    },
    buttonEdit: {
      backgroundColor: "#0fccce",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginRight: "5px"
    },
    buttonDanger: {
      backgroundColor: "#e94560",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    input: {
      padding: "12px",
      margin: "5px",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#1a1a2e",
      color: "white",
      flex: "1",
      minWidth: "200px",
      boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)"
    },
    select: {
      padding: "12px",
      margin: "5px",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#1a1a2e",
      color: "white",
      flex: "1",
      minWidth: "200px",
      boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)"
    },
    textarea: {
      padding: "12px",
      margin: "5px",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#1a1a2e",
      color: "white",
      width: "100%",
      minHeight: "100px",
      boxShadow: "inset 0 2px 5px rgba(0,0,0,0.2)"
    },
    error: {
      color: "#ff6b6b",
      backgroundColor: "rgba(255, 107, 107, 0.1)",
      padding: "15px",
      borderRadius: "5px",
      margin: "15px 0",
      borderLeft: "4px solid #ff6b6b"
    },
    success: {
      color: "#00d26a",
      backgroundColor: "rgba(0, 210, 106, 0.1)",
      padding: "15px",
      borderRadius: "5px",
      margin: "15px 0",
      borderLeft: "4px solid #00d26a"
    },
    loading: {
      textAlign: "center",
      color: "#0fccce",
      fontSize: "1.5rem",
      padding: "30px"
    },
    rowHighlight: {
      backgroundColor: "#1a1a2e"
    },
    rowHover: {
      backgroundColor: "#222242"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "15px"
    },
    sectionTitle: {
      color: "#0fccce",
      marginBottom: "20px",
      fontSize: "1.8rem",
      borderBottom: "2px solid #533483",
      paddingBottom: "10px"
    },
    posterThumb: {
      maxWidth: "60px",
      borderRadius: "5px",
      marginTop: "5px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    },
    formHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px"
    }
  };

  // 🎨 Estilos para la sección comparativa (AGREGADO)
  const techStyles = {
    wrap: {
      background: "#0f1126",
      borderRadius: "10px",
      padding: "25px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
    },
    container: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      margin: "10px -10px 0"
    },
    card: {
      background: "#fff",
      color: "#222",
      margin: "10px",
      padding: "18px",
      borderRadius: "10px",
      width: "260px",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.2s ease"
    },
    codeBlock: {
      background: "#272822",
      color: "#f8f8f2",
      padding: "10px",
      borderRadius: "6px",
      fontFamily: "monospace",
      fontSize: "13px",
      marginTop: "10px",
      overflowX: "auto",
      textAlign: "left"
    },
    btnRow: { textAlign: "center", marginTop: "10px" },
    btn: {
      color: "#fff",
      border: "none",
      padding: "10px 15px",
      borderRadius: "6px",
      cursor: "pointer",
      margin: "8px",
      fontWeight: "600"
    }
  };

  const getTechTheme = (tipo) => {
    switch (tipo) {
      case "odbc":
        return { bg: "#E3F2FD", border: "#007BFF", item: "#BBDEFB" };
      case "ado":
        return { bg: "#E8F5E9", border: "#28A745", item: "#C8E6C9" };
      case "jdbc":
        return { bg: "#FFF8E1", border: "#FFC107", item: "#FFE082" };
      case "nest":
        return { bg: "#FCE4EC", border: "#E83E8C", item: "#F8BBD0" };
      default:
        return { bg: "#ffffff", border: "#222", item: "#efefef" };
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🎬 CINEMATECA 🎬</h1>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {/* Sección de Filtros */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>🔍 Filtros de Búsqueda</h2>
        <div style={styles.filterSection}>
          <input 
            style={styles.input} 
            type="text" 
            name="titulo" 
            placeholder="Título de película" 
            value={filtros.titulo} 
            onChange={handleFilterChange} 
          />
          <select 
            style={styles.select} 
            name="id_genero" 
            value={filtros.id_genero} 
            onChange={handleFilterChange}
          >
            <option value="">Todos los géneros</option>
            {generos.map(g => <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>)}
          </select>
          <input 
            style={styles.input} 
            type="number" 
            name="año" 
            placeholder="Año de lanzamiento" 
            value={filtros.año} 
            onChange={handleFilterChange} 
          />
          <button 
            style={styles.button} 
            onMouseOver={(e) => Object.assign(e.target.style, styles.buttonHover)}
            onMouseOut={(e) => Object.assign(e.target.style, styles.button)}
            onClick={clearFilters}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Botón para mostrar/ocultar formulario */}
      <div style={{textAlign: "center", marginBottom: "25px"}}>
        <button 
          style={{
            ...styles.button, 
            backgroundColor: showForm ? "#e94560" : "#00d26a",
            padding: "15px 30px",
            fontSize: "1.1rem"
          }} 
          onMouseOver={(e) => Object.assign(e.target.style, {...styles.buttonHover, backgroundColor: showForm ? "#d33a54" : "#00b85a"})}
          onMouseOut={(e) => Object.assign(e.target.style, {...styles.button, backgroundColor: showForm ? "#e94560" : "#00d26a"})}
          onClick={() => {
            if (showForm && editingId) {
              cancelEdit();
            } else {
              setShowForm(!showForm);
            }
          }}
        >
          {showForm ? (editingId ? "❌ Cancelar Edición" : "❌ Ocultar Formulario") : "➕ Agregar Nueva Película"}
        </button>
      </div>

      {/* Formulario para agregar/editar película */}
      {showForm && (
        <div style={styles.formSection}>
          <div style={styles.formHeader}>
            <h2 style={{...styles.sectionTitle, color: "#fff", margin: 0}}>
              {editingId ? "✏️ Editar Película" : "📝 Agregar Nueva Película"}
            </h2>
            {editingId && (
              <button 
                style={{...styles.button, backgroundColor: "#6c757d"}} 
                onMouseOver={(e) => Object.assign(e.target.style, {...styles.buttonHover, backgroundColor: "#5a6268"})}
                onMouseOut={(e) => Object.assign(e.target.style, {...styles.button, backgroundColor: "#6c757d"})}
                onClick={cancelEdit}
              >
                ↶ Crear Nueva
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <input style={styles.input} type="text" name="titulo" placeholder="Título *" value={form.titulo} onChange={handleChange} required />
              <input style={styles.input} type="number" name="año" placeholder="Año *" value={form.año} onChange={handleChange} required />
              <input style={styles.input} type="number" name="duracion" placeholder="Duración (min) *" value={form.duracion} onChange={handleChange} required />
              <input style={styles.input} type="number" name="calificacion" placeholder="Calificación (0-10) *" value={form.calificacion} onChange={handleChange} required step="0.1" min="0" max="10" />
              <select style={styles.select} name="id_genero" value={form.id_genero} onChange={handleChange} required>
                <option value="">Seleccione Género *</option>
                {generos.map(g => <option key={g.id_genero} value={g.id_genero}>{g.nombre}</option>)}
              </select>
              <select style={styles.select} name="id_director" value={form.id_director} onChange={handleChange} required>
                <option value="">Seleccione Director *</option>
                {directores.map(d => <option key={d.id_director} value={d.id_director}>{d.nombre} {d.apellido}</option>)}
              </select>
              <input style={styles.input} type="url" name="poster_url" placeholder="URL del Poster" value={form.poster_url} onChange={handleChange} />
            </div>
            <textarea style={styles.textarea} name="sinopsis" placeholder="Sinopsis" value={form.sinopsis} onChange={handleChange}></textarea>
            <button 
              style={{...styles.button, marginTop: "15px", backgroundColor: editingId ? "#0fccce" : "#00d26a"}} 
              onMouseOver={(e) => Object.assign(e.target.style, {...styles.buttonHover, backgroundColor: editingId ? "#0db9bb" : "#00b85a"})}
              onMouseOut={(e) => Object.assign(e.target.style, {...styles.button, backgroundColor: editingId ? "#0fccce" : "#00d26a"})}
              type="submit" 
              disabled={loading}
            >
              {loading ? "⏳ Cargando..." : (editingId ? "💾 Guardar Cambios" : "🎬 Agregar Película")}
            </button>
          </form>
        </div>
      )}

      {/* Lista de Películas */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>
          📽️ Lista de Películas ({filtros.titulo || filtros.id_genero || filtros.año ? peliculasFiltradas.length : peliculas.length})
        </h2>
        
        {loading ? (
          <p style={styles.loading}>Cargando películas...</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Título</th>
                  <th style={styles.tableHeader}>Año</th>
                  <th style={styles.tableHeader}>Duración</th>
                  <th style={styles.tableHeader}>Calificación</th>
                  <th style={styles.tableHeader}>Género</th>
                  <th style={styles.tableHeader}>Director</th>
                  <th style={styles.tableHeader}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(filtros.titulo || filtros.id_genero || filtros.año ? peliculasFiltradas : peliculas).map((p, index) => (
                  <tr 
                    key={p.id_pelicula} 
                    style={index % 2 === 0 ? styles.rowHighlight : {}}
                    onMouseOver={(e) => Object.assign(e.target.parentNode.style, styles.rowHover)}
                    onMouseOut={(e) => Object.assign(e.target.parentNode.style, index % 2 === 0 ? styles.rowHighlight : {})}
                  >
                    <td style={styles.tableCell}>
                      <strong>{p.titulo}</strong>
                      {p.poster_url && (
                        <div>
                          <img src={p.poster_url} alt={`Poster de ${p.titulo}`} style={styles.posterThumb} />
                        </div>
                      )}
                    </td>
                    <td style={styles.tableCell}>{p.año_lanzamiento}</td>
                    <td style={styles.tableCell}>{p.duracion_minutos} min</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        display: "inline-block", 
                        padding: "5px 10px", 
                        borderRadius: "10px", 
                        backgroundColor: p.calificacion >= 7 ? "#00d26a" : p.calificacion >= 5 ? "#ffcc00" : "#e94560",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.9rem"
                      }}>
                        {p.calificacion} ⭐
                      </span>
                    </td>
                    <td style={styles.tableCell}>{p.genero}</td>
                    <td style={styles.tableCell}>{p.director}</td>
                    <td style={styles.tableCell}>
                      <button 
                        style={styles.buttonEdit} 
                        onMouseOver={(e) => e.target.style.backgroundColor = "#0db9bb"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#0fccce"}
                        onClick={() => loadMovieToEdit(p)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        style={styles.buttonDanger} 
                        onMouseOver={(e) => e.target.style.backgroundColor = "#d33a54"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#e94560"}
                        onClick={() => handleDelete(p.id_pelicula, p.titulo)}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔥 NUEVA SECCIÓN: Comparación de Tecnologías (AGREGADO) */}
      <div style={{ ...styles.card, ...techStyles.wrap }}>
        <h2 style={{ fontSize: "1.8rem", margin: 0, color: "#0fccce", textAlign: "center" }}>
          ⚡ Comparación de Tecnologías para Conexión a MariaDB/MySQL
        </h2>

        <div style={techStyles.container}>
          {/* ODBC */}
          <div
            style={techStyles.card}
            onClick={() => toggleInfo("odbc")}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="tech-title" style={{ fontSize: 20, marginBottom: 10 }}>ODBC</div>
            {infoOpen.odbc && (
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                  ODBC es un estándar para conectar aplicaciones con bases de datos usando drivers.
                </p>
                <div style={techStyles.codeBlock}>
                  <pre style={{ margin: 0 }}>
                    {`Driver={MariaDB ODBC 3.1 Driver};Server=localhost;Database=catalogo_peliculas;User=root;Password=;`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* ADO.NET */}
          <div
            style={techStyles.card}
            onClick={() => toggleInfo("ado")}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="tech-title" style={{ fontSize: 20, marginBottom: 10 }}>ADO.NET</div>
            {infoOpen.ado && (
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                  ADO.NET es el modelo de acceso a datos en .NET para fuentes relacionales.
                </p>
                <div style={techStyles.codeBlock}>
                  <pre style={{ margin: 0 }}>
                    {`string connStr = "Server=localhost;Database=catalogo_peliculas;User=root;Password=;";`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* JDBC */}
          <div
            style={techStyles.card}
            onClick={() => toggleInfo("jdbc")}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="tech-title" style={{ fontSize: 20, marginBottom: 10 }}>JDBC</div>
            {infoOpen.jdbc && (
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                  JDBC es la API de Java para interactuar con bases de datos.
                </p>
                <div style={techStyles.codeBlock}>
                  <pre style={{ margin: 0 }}>
                    {`String url = "jdbc:mysql://localhost:3306/catalogo_peliculas";
Connection conn = DriverManager.getConnection(url, "root", "");`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* NestJS */}
          <div
            style={techStyles.card}
            onClick={() => toggleInfo("nest")}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div className="tech-title" style={{ fontSize: 20, marginBottom: 10 }}>NestJS</div>
            {infoOpen.nest && (
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                  NestJS suele usar TypeORM para trabajar con MariaDB/MySQL.
                </p>
                <div style={techStyles.codeBlock}>
                  <pre style={{ margin: 0 }}>
                    {`TypeOrmModule.forRoot({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'catalogo_peliculas',
  entities: [Pelicula],
  synchronize: true,
});`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de ejecución */}
        <div style={techStyles.btnRow}>
          <button
            style={{ ...techStyles.btn, background: "#007BFF" }}
            onClick={() => ejecutarConsulta("odbc")}
          >
            Ejecutar con ODBC
          </button>
          <button
            style={{ ...techStyles.btn, background: "#28A745" }}
            onClick={() => ejecutarConsulta("ado")}
          >
            Ejecutar con ADO.NET
          </button>
          <button
            style={{ ...techStyles.btn, background: "#FFC107", color: "#222" }}
            onClick={() => ejecutarConsulta("jdbc")}
          >
            Ejecutar con JDBC
          </button>
          <button
            style={{ ...techStyles.btn, background: "#E83E8C" }}
            onClick={() => ejecutarConsulta("nest")}
          >
            Ejecutar con NestJS
          </button>
        </div>

        {/* Resultados con estilos por tecnología */}
        {resultadoConsulta.length > 0 && (
          (() => {
            const theme = getTechTheme(tecnologiaActiva);
            return (
              <div
                style={{
                  margin: "20px auto 0",
                  padding: "15px",
                  maxWidth: "900px",
                  borderRadius: "10px",
                  background: theme.bg,
                  borderLeft: `6px solid ${theme.border}`,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.12)"
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  🎬 Resultados con {tecnologiaActiva.toUpperCase()}
                </h3>
                <div>
                  {resultadoConsulta.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        margin: "6px 0",
                        padding: "8px",
                        borderRadius: "6px",
                        background: theme.item
                      }}
                    >
                      <strong>{p.titulo}</strong> ({p.año_lanzamiento}) - ⭐ {p.calificacion}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </div>
      {/* FIN NUEVA SECCIÓN */}
    </div>
  );
}
