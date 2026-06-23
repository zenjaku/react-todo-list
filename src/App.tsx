import { FloatingButton } from "./components/FloatingButton";
import { Navbar } from "./components/Navbar";
import { Homepage } from "./pages/Homepage";

function App() {
  return (
    <>
      <div className="container">
        <Navbar />
        <Homepage />

        {/* Floating Button */}
        <FloatingButton />
      </div>
    </>
  );
}

export default App;
