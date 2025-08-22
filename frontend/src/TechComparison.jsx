// components/TechComparison.js
import { useState } from "react";

const TechComparison = ({ setError, styles }) => {
  const [resultadoConsulta, setResultadoConsulta] = useState([]);
  const [tecnologiaActiva, setTecnologiaActiva] = useState("");
  const [infoOpen, setInfoOpen] = useState({
    odbc: false,
    ado: false,
    jdbc: false,
    nest: false,
    mongoose: false,
    sequelize: false,
    knex: false
  });
  const [loadingTech, setLoadingTech] = useState("");

  const toggleInfo = (key) => {
    setInfoOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tecnologias = [
    {
      id: "odbc",
      nombre: "ODBC",
      color: "#007BFF",
      descripcion: "Open Database Connectivity (ODBC) es un estándar de acceso a bases de datos que permite conectar aplicaciones con diversos sistemas de gestión de bases de datos.",
      ejemplo: `Driver={MariaDB ODBC 3.1 Driver};
Server=localhost;
Database=catalogo_peliculas;
User=root;
Password=;`,
      ventajas: ["Estándar ampliamente soportado", "Independiente del DBMS", "Funciona con múltiples lenguajes"],
      desventajas: ["Configuración compleja", "Rendimiento no óptimo", "Requiere drivers específicos"]
    },
    {
      id: "ado",
      nombre: "ADO.NET",
      color: "#28A745",
      descripcion: "ADO.NET es el modelo de acceso a datos para .NET Framework, proporcionando conectividad entre aplicaciones .NET y bases de datos.",
      ejemplo: `string connectionString = 
  "Server=localhost;Database=catalogo_peliculas;User=root;Password=;";
MySqlConnection connection = new MySqlConnection(connectionString);
connection.Open();`,
      ventajas: ["Integración con .NET", "Alto rendimiento", "Soporte para operaciones desconectadas"],
      desventajas: ["Limitado a ecosistema .NET", "Curva de aprendizaje", "Configuración manual"]
    },
    {
      id: "jdbc",
      nombre: "JDBC",
      color: "#FFC107",
      descripcion: "Java Database Connectivity (JDBC) es la API estándar de Java para conectarse con bases de datos relacionales.",
      ejemplo: `String url = "jdbc:mysql://localhost:3306/catalogo_peliculas";
Connection conn = DriverManager.getConnection(url, "root", "");
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM peliculas");`,
      ventajas: ["Estándar de Java", "Amplia documentación", "Soporte multiplataforma"],
      desventajas: ["Código verboso", "Gestión manual de recursos", "Configuración necesaria"]
    },
    {
      id: "nest",
      nombre: "NestJS + TypeORM",
      color: "#E83E8C",
      descripcion: "NestJS con TypeORM ofrece una solución moderna y tipada para acceso a bases de datos en aplicaciones Node.js.",
      ejemplo: `@Entity()
export class Pelicula {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  año: number;
}

// En el servicio
async findAll(): Promise<Pelicula[]> {
  return this.peliculaRepository.find();
}`,
      ventajas: ["Tipado estático", "Código limpio y organizado", "Migrations integradas"],
      desventajas: ["Curva de aprendizaje", "Overhead de configuración", "Abstracción compleja"]
    },
    {
      id: "mongoose",
      nombre: "Mongoose (MongoDB)",
      color: "#47B881",
      descripcion: "Mongoose es una librería ODM para MongoDB y Node.js que proporciona una solución basada en esquemas para modelar datos.",
      ejemplo: `const peliculaSchema = new mongoose.Schema({
  titulo: String,
  año: Number,
  duracion: Number
});

const Pelicula = mongoose.model('Pelicula', peliculaSchema);

// Consulta
Pelicula.find({ año: { $gt: 2000 } });`,
      ventajas: ["Esquemas fuertemente tipados", "Métodos útiles incorporados", "Fácil de usar"],
      desventajas: ["Solo para MongoDB", "Rendimiento en consultas complejas", "Curva de aprendizaje"]
    },
    {
      id: "sequelize",
      nombre: "Sequelize",
      color: "#3B82F6",
      descripcion: "Sequelize es un ORM para Node.js que soporta múltiples bases de datos SQL como PostgreSQL, MySQL, SQLite y MSSQL.",
      ejemplo: `const Pelicula = sequelize.define('Pelicula', {
  titulo: { type: DataTypes.STRING },
  año: { type: DataTypes.INTEGER }
});

// Consulta
Pelicula.findAll({
  where: { año: { [Op.gt]: 2000 } }
});`,
      ventajas: ["Soporte múltiples DB", "Migrations incluidas", "Consultas complejas"],
      desventajas: ["Curva de aprendizaje", "Rendimiento en grandes volúmenes", "Configuración compleja"]
    },
    {
      id: "knex",
      nombre: "Knex.js",
      color: "#7E3AF2",
      descripcion: "Knex.js es un constructor de consultas SQL para Node.js que funciona con múltiples bases de datos y ofrece tanto un query builder como migraciones.",
      ejemplo: `knex('peliculas')
  .select('*')
  .where('año', '>', 2000)
  .then(rows => {
    console.log(rows);
  });`,
      ventajas: ["Flexibilidad en consultas", "Sintaxis intuitiva", "Migrations integradas"],
      desventajas: ["No es un ORM completo", "Menor abstracción", "Escalabilidad limitada"]
    }
  ];

  const ejecutarConsulta = async (tecnologia) => {
    setLoadingTech(tecnologia);
    setError("");
    try {
      // En una implementación real, aquí llamarías a diferentes endpoints
      // según la tecnología seleccionada
      const res = await fetch(`http://localhost:5000/api/peliculas/tecnologia/${tecnologia}`);
      const data = await res.json();
      setResultadoConsulta(data);
      setTecnologiaActiva(tecnologia);
    } catch (err) {
      setError("Error al conectar con el backend para la tecnología " + tecnologia);
      console.error(err);
    } finally {
      setLoadingTech("");
    }
  };

  const techStyles = {
    wrap: {
      background: "#0f1126",
      borderRadius: "10px",
      padding: "25px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      marginTop: "30px"
    },
    container: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      margin: "10px -10px 0",
      gap: "15px"
    },
    card: {
      background: "#fff",
      color: "#222",
      margin: "0",
      padding: "18px",
      borderRadius: "10px",
      width: "300px",
      textAlign: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease"
    },
    codeBlock: {
      background: "#272822",
      color: "#f8f8f2",
      padding: "10px",
      borderRadius: "6px",
      fontFamily: "monospace",
      fontSize: "12px",
      marginTop: "10px",
      overflowX: "auto",
      textAlign: "left",
      maxHeight: "200px",
      overflowY: "auto"
    },
    btnRow: { 
      textAlign: "center", 
      marginTop: "20px",
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "10px"
    },
    btn: {
      color: "#fff",
      border: "none",
      padding: "10px 15px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.2s ease"
    },
    list: {
      textAlign: "left",
      fontSize: "14px",
      margin: "10px 0"
    }
  };

  return (
    <div style={techStyles.wrap}>
      <h2 style={{ ...styles.sectionTitle, textAlign: "center", color: "#fff" }}>
        ⚡ Comparación de Tecnologías de Base de Datos
      </h2>
      
      <p style={{ textAlign: "center", color: "#aaa", marginBottom: "25px" }}>
        Explora diferentes tecnologías para conectarse a bases de datos y sus características
      </p>

      <div style={techStyles.container}>
        {tecnologias.map(tech => (
          <div
            key={tech.id}
            style={{
              ...techStyles.card,
              transform: infoOpen[tech.id] ? "scale(1.03)" : "scale(1)",
              boxShadow: infoOpen[tech.id] ? `0 8px 16px ${tech.color}40` : "0 4px 8px rgba(0,0,0,0.1)",
              border: `2px solid ${tech.color}`
            }}
            onClick={() => toggleInfo(tech.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = `0 8px 16px ${tech.color}60`;
            }}
            onMouseOut={(e) => {
              if (!infoOpen[tech.id]) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }
            }}
          >
            <div style={{ 
              fontSize: "20px", 
              marginBottom: "10px",
              color: tech.color,
              fontWeight: "bold"
            }}>
              {tech.nombre}
            </div>
            
            {infoOpen[tech.id] && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ margin: "10px 0", fontSize: "14px", color: "#333", textAlign: "left" }}>
                  {tech.descripcion}
                </p>
                
                <div style={{ textAlign: "left", margin: "10px 0" }}>
                  <strong>Ventajas:</strong>
                  <ul style={techStyles.list}>
                    {tech.ventajas.map((v, i) => <li key={i}>✓ {v}</li>)}
                  </ul>
                </div>
                
                <div style={{ textAlign: "left", margin: "10px 0" }}>
                  <strong>Desventajas:</strong>
                  <ul style={techStyles.list}>
                    {tech.desventajas.map((d, i) => <li key={i}>✗ {d}</li>)}
                  </ul>
                </div>
                
                <div style={techStyles.codeBlock}>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {tech.ejemplo}
                  </pre>
                </div>
                
                <button
                  style={{ 
                    ...techStyles.btn, 
                    background: tech.color,
                    marginTop: "15px",
                    opacity: loadingTech === tech.id ? 0.7 : 1
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    ejecutarConsulta(tech.id);
                  }}
                  disabled={loadingTech === tech.id}
                >
                  {loadingTech === tech.id ? "⏳ Ejecutando..." : "🚀 Probar esta tecnología"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resultados de la consulta */}
      {resultadoConsulta.length > 0 && (
        <div style={{
          margin: "30px auto 0",
          padding: "20px",
          maxWidth: "900px",
          borderRadius: "10px",
          background: "#1a1a2e",
          border: "1px solid #333",
          boxShadow: "0 4px 8px rgba(0,0,0,0.12)"
        }}>
          <h3 style={{ marginTop: 0, color: "#0fccce", display: "flex", alignItems: "center", gap: "10px" }}>
            📊 Resultados con {tecnologiaActiva.toUpperCase()}
            <span style={{
              fontSize: "12px",
              background: tecnologias.find(t => t.id === tecnologiaActiva)?.color || "#666",
              padding: "4px 8px",
              borderRadius: "10px"
            }}>
              {resultadoConsulta.length} registros
            </span>
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "15px",
            marginTop: "15px"
          }}>
            {resultadoConsulta.slice(0, 6).map((p, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: "#16213e",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{p.titulo}</div>
                <div style={{ fontSize: "14px", color: "#aaa" }}>
                  Año: {p.año_lanzamiento} | ⭐ {p.calificacion}
                </div>
              </div>
            ))}
          </div>
          
          {resultadoConsulta.length > 6 && (
            <div style={{ 
              textAlign: "center", 
              marginTop: "15px",
              color: "#888",
              fontSize: "14px"
            }}>
              ...y {resultadoConsulta.length - 6} más
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechComparison;