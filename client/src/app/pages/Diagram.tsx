import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useState } from "react";

export default function Diagram() {
  const [drawApi, setDrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  async function handleClick() {
    if (!drawApi) {
      console.error("Excalidraw API not available");
      return;
    }

    const elements = drawApi.getSceneElements();
    if (elements.length === 0) {
      console.warn("No elements on the canvas to export.");
      setSvg(null); // Clear previous SVG if any
      alert("Canvas is empty. Add some elements to export.");
      return;
    }

    try {
      const svgElement: SVGSVGElement = await exportToSvg({
        elements: elements,
        appState: drawApi.getAppState(),
        files: drawApi.getFiles(),
        // Optional: you can add more export options here
        // exportPadding: 10,
        // exportBackground: true, // Set to true if you want the canvas background color
      });
      setSvg(svgElement.outerHTML);
    } catch (error) {
      console.error("Error exporting to SVG:", error);
      setSvg(null);
      alert("Failed to export SVG. Check console for details.");
    }
  }

  return (
    <>
      <div className="canvas h-[500px]">
        <Excalidraw excalidrawAPI={(api) => setDrawApi(api)} />
      </div>
      <div className="mt-2">
        <button
          onClick={handleClick}
          disabled={!drawApi}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Export to SVG
        </button>
        {svg && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">Generated SVG:</h3>
            {/* Render the SVG string in a div */}
            <div dangerouslySetInnerHTML={{ __html: svg }} />
            {/* Optionally, display the raw SVG string for debugging */}
            {/* 
            <h4 className="text-md font-semibold mt-4 mb-1">Raw SVG Code:</h4>
            <textarea 
              value={svg} 
              readOnly 
              className="w-full h-40 p-2 border rounded font-mono text-sm" 
            />
            */}
          </div>
        )}
      </div>
    </>
  );
}
