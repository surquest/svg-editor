'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { 
  Panel, 
  Group as PanelGroup, 
  Separator as PanelResizeHandle 
} from 'react-resizable-panels';
import EditorHeader from './components/EditorHeader';
import SvgCanvas from './components/SvgCanvas';
import CodeEditor from './components/CodeEditor';
import PropertiesPanel from './components/PropertiesPanel';
import { OnMount } from '@monaco-editor/react';

export default function EditorPage() {
  const [svgCode, setSvgCode] = useState('');
  const [editor, setEditor] = useState<any>(null);
  const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
  const [attributes, setAttributes] = useState<{ name: string, value: string }[]>([]);
  const [textContent, setTextContent] = useState<string>('');

  const handleEditorMount: OnMount = (editor) => {
    setEditor(editor);
  };

  useEffect(() => {
    fetch('/default.svg')
      .then(res => res.text())
      .then(text => setSvgCode(text))
      .catch(err => console.error('Failed to load default SVG:', err));
  }, []);

  const updateAttributes = (updates: Record<string, string>) => {
    if (!selectedElement || !editor) return;

    const tagName = selectedElement.tagName.toLowerCase();
    const classAttr = selectedElement.getAttribute('class');
    const transformAttr = selectedElement.getAttribute('transform');
    const idAttr = selectedElement.getAttribute('id');

    const model = editor.getModel();
    const content = model.getValue();

    let markers = [tagName];
    if (idAttr) markers.push(`id="${idAttr}"`);
    else if (classAttr) markers.push(`class="${classAttr}"`);
    else if (transformAttr) markers.push(`transform="${transformAttr}"`);

    const lines = content.split('\n');
    let targetLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (markers.every(m => lines[i].includes(m))) {
        targetLineIndex = i;
        break;
      }
    }

    if (targetLineIndex !== -1) {
      let newLine = lines[targetLineIndex];

      Object.entries(updates).forEach(([name, value]) => {
        const attrRegex = new RegExp(`${name}="[^"]*"`, 'g');
        if (newLine.match(attrRegex)) {
          newLine = newLine.replace(attrRegex, `${name}="${value}"`);
        } else if (newLine.endsWith(' />')) {
          newLine = newLine.replace(' />', ` ${name}="${value}" />`);
        } else if (newLine.includes('>')) {
          const parts = newLine.split('>');
          newLine = parts[0] + ` ${name}="${value}"` + '>' + parts.slice(1).join('>');
        }

        selectedElement.setAttribute(name, value);
      });

      lines[targetLineIndex] = newLine;
      const newCode = lines.join('\n');
      setSvgCode(newCode);

      setAttributes(prev => {
        const next = [...prev];
        Object.keys(updates).forEach((key) => {
          const found = next.find(a => a.name === key);
          if (found) found.value = updates[key];
          else next.push({ name: key, value: updates[key] });
        });
        return next;
      });
    }
  };

  const updateAttribute = (name: string, value: string) => {
    if (!selectedElement || !editor) return;

    // Use a unique marker to find the element in the source code
    // Browser changes outerHTML (attribute order, spacing, quotes)
    // and this often breaks string replacement.
    
    const tagName = selectedElement.tagName.toLowerCase();
    
    // Get unique attributes to refine the search in the model
    const classAttr = selectedElement.getAttribute('class');
    const transformAttr = selectedElement.getAttribute('transform');
    const xAttr = selectedElement.getAttribute('x');
    const yAttr = selectedElement.getAttribute('y');

    const model = editor.getModel();
    const content = model.getValue();
    
    // Strategy: find the line that contains the key markers of the element
    let markers = [tagName];
    if (classAttr) markers.push(`class="${classAttr}"`);
    if (transformAttr) markers.push(`transform="${transformAttr}"`);
    if (xAttr && yAttr) markers.push(`x="${xAttr}" y="${yAttr}"`);

    // Simple line-based replacement for reliability
    const lines = content.split('\n');
    let targetLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (markers.every(m => line.includes(m))) {
            targetLineIndex = i;
            break;
        }
    }

    if (targetLineIndex !== -1) {
        const line = lines[targetLineIndex];
        
        // Use a regex to replace the attribute value or add it if missing
        const attrRegex = new RegExp(`${name}="[^"]*"`, 'g');
        let newLine = line;
        
        if (line.match(attrRegex)) {
            newLine = line.replace(attrRegex, `${name}="${value}"`);
        } else {
            // Append before the closing tag part
            if (line.endsWith(' />')) {
                newLine = line.replace(' />', ` ${name}="${value}" />`);
            } else if (line.includes('>')) {
                const parts = line.split('>');
                newLine = parts[0] + ` ${name}="${value}"` + '>' + parts.slice(1).join('>');
            }
        }

        lines[targetLineIndex] = newLine;
        const newCode = lines.join('\n');
        
        setSvgCode(newCode);
        
        // Update selection state for UI
        setAttributes(prev => prev.map(attr => attr.name === name ? { ...attr, value } : attr));
        
        // Update the actual DOM element so subsequent edits work
    selectedElement.setAttribute(name, value);
    }
  };

  const updateTextContent = (value: string) => {
    if (!selectedElement || !editor || selectedElement.tagName.toLowerCase() !== 'text') return;

    const model = editor.getModel();
    const content = model.getValue();
    
    // Use the same search strategy as updateAttribute
    const classAttr = selectedElement.getAttribute('class');
    const transformAttr = selectedElement.getAttribute('transform');
    const xAttr = selectedElement.getAttribute('x');
    const yAttr = selectedElement.getAttribute('y');

    const lines = content.split('\n');
    let targetLineIndex = -1;
    let markers = ['text'];
    if (classAttr) markers.push(`class="${classAttr}"`);
    if (transformAttr) markers.push(`transform="${transformAttr}"`);
    if (xAttr && yAttr) markers.push(`x="${xAttr}" y="${yAttr}"`);

    for (let i = 0; i < lines.length; i++) {
        if (markers.every(m => lines[i].includes(m))) {
            targetLineIndex = i;
            break;
        }
    }

    if (targetLineIndex !== -1) {
        const line = lines[targetLineIndex];
        // Replace content between > and <
        const textRegex = />([^<]*)</;
        if (line.match(textRegex)) {
            const newLine = line.replace(textRegex, `>${value}<`);
            lines[targetLineIndex] = newLine;
            const newCode = lines.join('\n');
            setSvgCode(newCode);
            setTextContent(value);
            selectedElement.textContent = value;
        }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Check if we clicked an SVG element (rect, circle, text, path, etc.)
    const clicked = e.target as SVGElement;

    if (!clicked || !(clicked instanceof SVGElement) || clicked.tagName.toLowerCase() === 'svg') {
      setSelectedElement(null);
      return;
    }

    // Select child shape by default. Use Shift+Click to select the nearest parent <g>.
    const parentGroup = clicked.closest('g');
    const shouldSelectGroup = e.shiftKey && parentGroup instanceof SVGElement;
    const target = shouldSelectGroup ? (parentGroup as SVGElement) : clicked;

    if (target.tagName.toLowerCase() === 'text') {
      setTextContent(target.textContent || '');
    } else {
      setTextContent('');
    }
    setSelectedElement(target);

    // Extract attributes for editing
    const attrList: { name: string, value: string }[] = [];
    for (let i = 0; i < target.attributes.length; i++) {
      const attr = target.attributes[i];
      attrList.push({ name: attr.name, value: attr.value });
    }
    setAttributes(attrList);

    if (editor) {
      const model = editor.getModel();
      const content = model.getValue();
      
      const id = target.getAttribute('id');
      const transform = target.getAttribute('transform');
      const className = target.getAttribute('class');
      const x = target.getAttribute('x');
      const y = target.getAttribute('y');
      
      let index = -1;

      if (index === -1 && x && y) {
        let coordSearch = `x="${x}" y="${y}"`;
        index = content.indexOf(coordSearch);
      }

      if (index === -1 && transform) {
          index = content.indexOf(`transform="${transform}"`);
      }

      if (index === -1 && className) {
          index = content.indexOf(`class="${className}"`);
      }
      
      if (index === -1) {
        index = content.indexOf(`<${target.tagName.toLowerCase()}`);
      }
      
      if (index !== -1) {
        const startPos = model.getPositionAt(index);
        const endLineNumber = startPos.lineNumber;
        const endColumn = model.getLineMaxColumn(endLineNumber);
        
        editor.setSelection({
          startLineNumber: startPos.lineNumber,
          startColumn: 1,
          endLineNumber: endLineNumber,
          endColumn: endColumn
        });
        
        editor.revealRangeInCenter({
          startLineNumber: startPos.lineNumber,
          startColumn: 1,
          endLineNumber: endLineNumber,
          endColumn: endColumn
        });
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <EditorHeader />

      <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        <PanelGroup orientation="horizontal">
          <Panel defaultSize={50} minSize={20}>
            <SvgCanvas
              svgCode={svgCode}
              onCanvasClick={handleCanvasClick}
              selectedElement={selectedElement}
            />
          </Panel>

          <PanelResizeHandle style={{ width: '8px', background: '#f0f0f0', cursor: 'col-resize' }} />
            <Panel defaultSize={50} minSize={20}>
              <CodeEditor
                svgCode={svgCode}
                onEditorMount={handleEditorMount}
                onChange={setSvgCode}
              />
            </Panel>
        </PanelGroup>

        <PropertiesPanel
          selectedElement={selectedElement}
          attributes={attributes}
          textContent={textContent}
          onAttributeChange={updateAttribute}
          onTextContentChange={updateTextContent}
          onClose={() => setSelectedElement(null)}
        />
      </Box>
    </Box>
  );
}
