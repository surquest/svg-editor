# SVG Studio

SVG Studio is a browser-based SVG editor implemented in a single HTML file (`src/index.html`).
It provides a split workspace with a live SVG code editor on the left and an interactive canvas on the right, so edits can be made either visually or directly in markup.

Showcase: https://surquest.github.io/svg-editor/

## Highlights

- Dual editing modes: visual manipulation and direct SVG text editing.
- Shape creation tools: rectangle, circle, line, and text.
- Selection tools:
- Single select by click.
- Multi-select with `Shift + Click`.
- Marquee (drag box) selection.
- Transform tools:
- Drag to move selected elements.
- Resize with handles (including line endpoint handles for `<line>` elements).
- Keyboard nudging with arrow keys (`Shift` for larger steps).
- Grouping and ungrouping for multiple selected elements.
- Layer controls to bring selected elements to front or send them to back.
- Alignment tools for left/center/right and top/middle/bottom.
- Property panel for quick attribute edits (position, dimensions, fill, stroke, opacity, text content, and more depending on element type).
- Code-awareness helpers:
- Selection highlighting in the code editor.
- Auto-formatting/serialization when syncing DOM to SVG source.
- Export/copy options:
- Copy selected elements as SVG (with clipboard fallbacks).
- Download current SVG as `export.svg`.
- Undo support (`Ctrl+Z`) with a bounded history.

## Tech Stack

- HTML, CSS, and vanilla JavaScript.
- Tailwind CSS (loaded via CDN) for UI styling.
- Native browser SVG APIs (`DOMParser`, `XMLSerializer`, SVG geometry methods).

## Project Structure

```text
svg-editor/
	README.md
	src/
		index.html
```

## Getting Started

Because this project is a static page, no build step is required.

1. Clone or download the repository.
2. Open `src/index.html` in a modern browser.

Optional local-server approach (recommended for consistent browser behavior):

```powershell
# from repository root
python -m http.server 5500
```

Then open `http://localhost:5500/src/index.html`.

## How to Use

1. Add shapes from the top toolbar.
2. Select and manipulate elements directly on the canvas.
3. Fine-tune attributes in the Properties panel.
4. Edit raw SVG in the code pane when needed.
5. Use copy/download actions to export your work.

## Keyboard Shortcuts

- `Ctrl+A`: Select all drawable root-level SVG elements.
- `Ctrl+C`: Copy selected elements.
- `Ctrl+V`: Paste clipboard SVG content (if available).
- `Ctrl+Z`: Undo.
- `Delete` / `Backspace`: Delete selected elements.
- `Arrow Keys`: Move selected elements by 1px.
- `Shift + Arrow Keys`: Move selected elements by 10px.
- `Escape`: Close properties sidebar.

## Notes and Limitations

- The application currently lives in a single file for simplicity.
- Clipboard behavior can vary by browser security policies and permissions.
- Parsing invalid SVG source in the editor will not update the canvas until valid markup is restored.

## Future Improvement Ideas

- Add redo support.
- Add snapping/grid controls.
- Add richer shape tools (paths, pen, boolean operations).
- Persist projects to local storage or file import/export.
- Split code into modular JS/CSS files for maintainability.
