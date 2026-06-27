export function FloatingButton() {
  function handleClick() {
    alert("button clicked!");
  }
  return <button className="floating-btn" onClick={handleClick}> Add Note </button>;
}
