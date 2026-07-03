export function AboutPage() {
  return (
    <div className="notebook-page">
      <h2>About The Todo System</h2>
      <p>
        Welcome to the Classic Notepad Todo List! This system was built to provide a tactile, nostalgic interface 
        for managing daily tasks. Designed around the aesthetic of physical stationery, legal pads, and sticky notes, 
        it turns digital task organization into a charming desk board.
      </p>
      <p>
        The application is powered by React, TypeScript, Node.js, and SQLite, featuring a fully custom-tailored CSS styling 
        system to emulate real-life paper textures, stamps, pushpins, and hand-drawn designs.
      </p>

      <h3>Creator Details</h3>
      <table className="creator-info-table">
        <tbody>
          <tr>
            <td>Name:</td>
            <td>Renzo Tomarao (Zenjaku)</td>
          </tr>
          <tr>
            <td>Website:</td>
            <td>
              <a href="https://github.com/zenjaku" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>
                github.com/zenjaku
              </a>
            </td>
          </tr>
          <tr>
            <td>System Born:</td>
            <td>July 2026</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
