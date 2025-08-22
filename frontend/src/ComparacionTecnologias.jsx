import { useState } from "react";

export default function ComparacionTecnologias() {
  const [peliculas, setPeliculas] = useState([]);
  const [tecnologia, setTecnologia] = useState("");

  const ejecutarConsulta = async (tipo) => {
    try {
      const res = await fetch("http://localhost:5000/api/peliculas");
      const data = await res.json();
      setPeliculas(data);
      setTecnologia(tipo);
    } catch (err) {
      alert("❌ Error al conectar con el backend");
      console.error(err);
    }
  };

  const ejemplos = {
    odbc: `
using System.Data.Odbc;

OdbcConnection conn = new OdbcConnection("DSN=MiConexion;");
conn.Open();
OdbcCommand cmd = new OdbcCommand("SELECT * FROM peliculas", conn);
OdbcDataReader reader = cmd.ExecuteReader();
while (reader.Read()) {
    Console.WriteLine(reader["titulo"]);
}
conn.Close();
    `,
    ado: `
using System.Data.SqlClient;

SqlConnection conn = new SqlConnection("Server=.;Database=Cinemateca;Trusted_Connection=True;");
conn.Open();
SqlCommand cmd = new SqlCommand("SELECT * FROM peliculas", conn);
SqlDataReader reader = cmd.ExecuteReader();
while (reader.Read()) {
    Console.WriteLine(reader["titulo"]);
}
conn.Close();
    `,
    jdbc: `
import java.sql.*;

Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/cinemateca","root","");
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM peliculas");
while(rs.next()){
    System.out.println(rs.getString("titulo"));
}
conn.close();
    `,
    nest: `
// service.ts
findAll() {
  return this.prisma.pelicula.findMany();
}

// controller.ts
@Get()
findAll() {
  return this.peliculasService.findAll();
}
    `,
  };

  const estilos = {
    odbc: { background: "#E3F2FD", borderLeft: "6px solid #007BFF" },
    ado: { background: "#E8F5E9", borderLeft: "6px solid #28A745" },
    jdbc: { background: "#FFF8E1", borderLeft: "6px solid #FFC107" },
    nest: { background: "#FCE4EC", borderLeft: "6px solid #E83E8C" },
  };

  return (
    <div style={{ marginTop: "50px" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>⚡ Comparación de Tecnologías</h2>

      {/* Botones */}
      <div style={{ textAlign: "center" }}>
        <button style={{ margin: "10px", padding: "10px", background: "#007BFF", color: "#fff", border: "none", borderRadius: "5px" }}
          onClick={() => ejecutarConsulta("odbc")}>
          Ejecutar con ODBC
        </button>
        <button style={{ margin: "10px", padding: "10px", background: "#28A745", color: "#fff", border: "none", borderRadius: "5px" }}
          onClick={() => ejecutarConsulta("ado")}>
          Ejecutar con ADO.NET
        </button>
        <button style={{ margin: "10px", padding: "10px", background: "#FFC107", border: "none", borderRadius: "5px" }}
          onClick={() => ejecutarConsulta("jdbc")}>
          Ejecutar con JDBC
        </button>
        <button style={{ margin: "10px", padding: "10px", background: "#E83E8C", color: "#fff", border: "none", borderRadius: "5px" }}
          onClick={() => ejecutarConsulta("nest")}>
          Ejecutar con NestJS
        </button>
      </div>

      {/* Resultados */}
      {tecnologia && (
        <div style={{ marginTop: "20px", padding: "20px", borderRadius: "10px", ...estilos[tecnologia] }}>
          <h3>🎬 Resultados con {tecnologia.toUpperCase()}</h3>
          {peliculas.map((p) => (
            <div key={p.id_pelicula} style={{ margin: "5px 0", padding: "8px", borderRadius: "6px", background: "#fff" }}>
              <strong>{p.titulo}</strong> ({p.año_lanzamiento}) - ⭐ {p.calificacion}
            </div>
          ))}

          {/* Ejemplo de código */}
          <div style={{ marginTop: "20px" }}>
            <h4>📌 Ejemplo de código:</h4>
            <pre style={{ background: "#222", color: "#0f0", padding: "15px", borderRadius: "10px", overflowX: "auto" }}>
              {ejemplos[tecnologia]}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
