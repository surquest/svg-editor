# SVG Live Editor

A sophisticated, browser-based SVG editor built with Next.js, Material UI, and Interact.js. This editor allows for real-time SVG manipulation through both a visual canvas and a code editor.

## Features

- **Live Preview**: Instantly see changes as you edit the SVG source code.
- **Visual Canvas**: Drag and resize SVG elements directly on the canvas using `interactjs`.
- **Properties Panel**: View and edit attributes of the currently selected SVG element.
- **Multi-Selection Control**:
  - Select multiple elements using **Shift + Click**.
  - **Alignment Tools**: Align selected shapes to the left, center, right, top, middle, or bottom.
  - **Bulk Actions**: Delete multiple selected elements at once.
  - Smart positioning: Automatically handles `<g>` groups and `transform: translate()` attributes.
- **Monaco Code Editor**: Fully integrated code editor for direct SVG manipulation.
- **Material UI Design**: Consistent and professional interface using MUI v7.

## Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Material UI (MUI) v7](https://mui.com/)
- **Interactive Layers**: [Interact.js](https://interactjs.io/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Deployment**: GitHub Pages via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/svg-editor.git
   cd svg-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The project is configured for static export and automated deployment to GitHub Pages.

- **Config**: `next.config.ts` uses `output: 'export'`.
- **Workflow**: `.github/workflows/nextjs.yml` handles building and uploading the static site.

## Project Structure

- `src/app/editor`: Main editor page and logic.
  - `components/SvgCanvas.tsx`: The primary interactive SVG rendering layer.
  - `components/MultiSelectControl.tsx`: UI for managing multiple selected elements.
  - `components/CodeEditor.tsx`: Monaco editor integration.
  - `components/PropertiesPanel.tsx`: Attribute inspector and editor.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
