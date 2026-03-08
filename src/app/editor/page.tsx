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
  const [selectedElements, setSelectedElements] = useState<SVGElement[]>([]);
  const [attributes, setAttributes] = useState<{ name: string, value: string }[]>([]);
  const [textContent, setTextContent] = useState<string>('');

  const selectedElement = selectedElements[0] || null;

  const handleEditorMount: OnMount = (editor) => {
    setEditor(editor);
  };

  useEffect(() => {
    fetch('/default.svg')
      .then(res => res.text())
      .then(text => setSvgCode(text))
      .catch(err => console.error('Failed to load default SVG:', err));
  }, []);

  const updateAttributes = (updates: Record<string, string>, targetElement: SVGElement | null = selectedElement) => {
    if (!targetElement || !editor) return;

    const tagName = targetElement.tagName.toLowerCase();
    
    const ownerSvg = targetElement.closest('svg');
    let elemIndex = -1;
    if (ownerSvg) {
      const all = Array.from(ownerSvg.querySelectorAll(tagName));
      elemIndex = all.indexOf(targetElement);
    }

    const model = editor.getModel();
    const content = model.getValue();

    const lines = content.split('\n');
    let targetLineIndex = -1;

    if (elemIndex !== -1) {
      const tagRegex = new RegExp(`<${tagName}\\b`, 'g');
      let match;
      let count = -1;
      while ((match = tagRegex.exec(content)) !== null) {
        count++;
        if (count === elemIndex) {
          const pos = model.getPositionAt(match.index);
          targetLineIndex = pos.lineNumber - 1;
          break;
        }
      }
    }

    // Fallback if regex failed
    if (targetLineIndex === -1) {
      const classAttr = targetElement.getAttribute('class');
      const transformAttr = targetElement.getAttribute('transform');
      const idAttr = targetElement.getAttribute('id');
      let markers = [tagName];
      if (idAttr) markers.push(`id="${idAttr}"`);
      else if (classAttr) markers.push(`class="${classAttr}"`);
      else if (transformAttr) markers.push(`transform="${transformAttr}"`);
      
      for (let i = 0; i < lines.length; i++) {
        if (markers.every(m => lines[i].includes(m))) {
          targetLineIndex = i;
          break;
        }
      }
    }

    if (targetLineIndex !== -1) {
      let newLine = lines[targetLineIndex];

      Object.entries(updates).forEach(([name, value]) => {
        const attrRegex = new RegExp(`${name}="[^"]*"`, 'g');
        if (newLine.match(attrRegex)) {
          newLine = newLine.replace(attrRegex, `${name}="${value}"`);
        } else {
          newLine = newLine.replace(/(\s*\/?>)/, ` ${name}="${value}"$1`);
        }

        targetElement.setAttribute(name, value);
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

      setSelectedElements(prev => [...prev.filter(el => el !== targetElement), targetElement]);
    }
  };

  const handleElementTransform = (element: SVGElement, updates: Record<string, string>) => {
    updateAttributes(updates, element);
  };

  const updateAttribute = (name: string, value: string) => {
    if (!selectedElement || !editor) return;

    const tagName = selectedElement.tagName.toLowerCase();
    
    const ownerSvg = selectedElement.closest('svg');
    let elemIndex = -1;
    if (ownerSvg) {
      const all = Array.from(ownerSvg.querySelectorAll(tagName));
      elemIndex = all.indexOf(selectedElement);
    }

    const model = editor.getModel();
    const content = model.getValue();
    
    const lines = content.split('\n');
    let targetLineIndex = -1;

    if (elemIndex !== -1) {
      const tagRegex = new RegExp(`<${tagName}\\b`, 'g');
      let match;
      let count = -1;
      while ((match = tagRegex.exec(content)) !== null) {
        count++;
        if (count === elemIndex) {
          const pos = model.getPositionAt(match.index);
          targetLineIndex = pos.lineNumber - 1;
          break;
        }
      }
    }

    if (targetLineIndex === -1) {
      let markers = [tagName];
      const classAttr = selectedElement.getAttribute('class');
      const transformAttr = selectedElement.getAttribute('transform');
      if (classAttr) markers.push(`class="${classAttr}"`);
      if (transformAttr) markers.push(`transform="${transformAttr}"`);

      for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (markers.every(m => line.includes(m))) {
              targetLineIndex = i;
              break;
          }
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
            newLine = line.replace(/(\s*\/?>)/, ` ${name}="${value}"$1`);
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

    const tagName = 'text';
    const ownerSvg = selectedElement.closest('svg');
    let elemIndex = -1;
    if (ownerSvg) {
      const all = Array.from(ownerSvg.querySelectorAll(tagName));
      elemIndex = all.indexOf(selectedElement as SVGTextElement);
    }

    const model = editor.getModel();
    const content = model.getValue();
    const lines = content.split('\n');
    let targetLineIndex = -1;

    if (elemIndex !== -1) {
      const tagRegex = new RegExp(`<${tagName}\\b`, 'g');
      let match;
      let count = -1;
      while ((match = tagRegex.exec(content)) !== null) {
        count++;
        if (count === elemIndex) {
          const pos = model.getPositionAt(match.index);
          targetLineIndex = pos.lineNumber - 1;
          break;
        }
      }
    }

    if (targetLineIndex === -1) {
      let markers = ['text'];
      const classAttr = selectedElement.getAttribute('class');
      const transformAttr = selectedElement.getAttribute('transform');
      if (classAttr) markers.push(`class="${classAttr}"`);
      if (transformAttr) markers.push(`transform="${transformAttr}"`);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (markers.every(m => line.includes(m))) {
            targetLineIndex = i;
            break;
        }
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
      setSelectedElements([]);
      return;
    }

    // Select child shape by default. Use Shift+Click to select the nearest parent <g>.
    const parentGroup = clicked.closest('g');
    const shouldSelectGroup = e.ctrlKey && parentGroup instanceof SVGElement;
    const target = (shouldSelectGroup ? (parentGroup as SVGElement) : clicked) as SVGElement;

    if (e.shiftKey) {
      // Toggle selection with Shift key
      setSelectedElements(prev => {
        const isSelected = prev.includes(target);
        if (isSelected) {
          return prev.filter(el => el !== target);
        } else {
          return [...prev, target];
        }
      });
    } else {
      // Normal selection
      setSelectedElements([target]);
    }

    if (target.tagName.toLowerCase() === 'text') {
      setTextContent(target.textContent || '');
    } else {
      setTextContent('');
    }

    // Extract attributes for editing - show attributes of the last selected (primary) element
    const attrList: { name: string, value: string }[] = [];
    for (let i = 0; i < target.attributes.length; i++) {
      const attr = target.attributes[i];
      attrList.push({ name: attr.name, value: attr.value });
    }
    setAttributes(attrList);

    if (editor) {
      const model = editor.getModel();
      const content = model.getValue();
      const tagName = target.tagName.toLowerCase();
      
      let index = -1;
      const ownerSvg = target.closest('svg');
      let elemIndex = -1;
      if (ownerSvg) {
        const all = Array.from(ownerSvg.querySelectorAll(tagName));
        elemIndex = all.indexOf(target);
      }

      if (elemIndex !== -1) {
        const tagRegex = new RegExp(`<${tagName}\\b`, 'g');
        let match;
        let count = -1;
        while ((match = tagRegex.exec(content)) !== null) {
          count++;
          if (count === elemIndex) {
            index = match.index;
            break;
          }
        }
      }
      
      if (index === -1) {
        const id = target.getAttribute('id');
        const transform = target.getAttribute('transform');
        const className = target.getAttribute('class');
        const x = target.getAttribute('x');
        const y = target.getAttribute('y');
        
        if (x && y) {
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
          index = content.indexOf(`<${tagName}`);
        }
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
              onElementTransform={handleElementTransform}
              selectedElements={selectedElements}
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
          selectedElements={selectedElements}
          attributes={attributes}
          textContent={textContent}
          onAttributeChange={updateAttribute}
          onTextContentChange={updateTextContent}
          onClose={() => setSelectedElements([])}
        />
      </Box>
    </Box>
  );
}
