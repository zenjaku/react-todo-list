export function HelpPage() {
  return (
    <div className="notebook-page">
      <h2>User Guide & Help</h2>
      <p>
        Getting organized is easy with the Classic Notepad task manager. Here is a quick guide on how to navigate and use the board:
      </p>

      <h3>📋 Managing Your Board</h3>
      <ul>
        <li>
          <strong>Adding a Task:</strong> Click the red circular pushpin button in the bottom-right corner of the desk screen. Fill in a short task title, detailed description, and choose a target date.
        </li>
        <li>
          <strong>Reading Task Details:</strong> Click directly on any sticky note card on your board. This opens a vintage legal pad detail view.
        </li>
        <li>
          <strong>Updating a Task:</strong> Inside the legal pad view, click the <strong>Update</strong> button at the bottom to open the edit form. You can modify any details or mark the task as "Completed".
        </li>
        <li>
          <strong>Deleting a Task:</strong> Click the <strong>Delete</strong> button at the bottom of the legal pad view to permanently discard a note.
        </li>
      </ul>

      <h3>🏷️ Rubber Ink Seals</h3>
      <p>
        Your notes dynamically receive ink seals based on their current status:
      </p>
      <ul>
        <li>
          <strong>Completed Stamp:</strong> Once a task is marked completed, a green ink stamp will seal the note to celebrate your success.
        </li>
        <li>
          <strong>Overdue Stamp:</strong> If a task date has passed and the task remains incomplete, it will receive a red ink stamp to highlight that it is past due.
        </li>
      </ul>

      <h3>💡 Navigation Tips</h3>
      <p>
        Use the binder divider tabs at the top of your board to quickly switch between the main board, creator info, and this help guide.
      </p>
    </div>
  );
}
