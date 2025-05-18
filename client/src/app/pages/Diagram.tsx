import { Excalidraw, exportToSvg } from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { uploadDiagram } from "../../api/uploadApi";
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

interface Diagram {
  elements: NonDeletedExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
}

export default function Diagram({ diagramUrl }: { diagramUrl: string }) {
  const [drawApi, setDrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const id = diagramUrl ? getIdFromDiagramUrl(diagramUrl) : undefined;
  const { data } = useQuery<Diagram>({
    queryKey: ["diagram", id],
    queryFn: async () => {
      const res = await fetch(`/media/dgsource/${id}.json`);
      if (!res.ok) {
        throw new Error("Failed to fetch diagram");
      }
      const data = await res.json();
      return data;
    },
  });
  async function handleClick() {
    if (!drawApi) {
      console.error("Excalidraw API not available");
      return;
    }

    const elements = drawApi.getSceneElements();
    if (elements.length === 0) return;

    try {
      const svgElement: SVGSVGElement = await exportToSvg({
        elements: elements,
        appState: drawApi.getAppState(),
        files: drawApi.getFiles(),
        exportPadding: 10,
        exportBackground: true, // Set to true if you want the canvas background color
      });
      const svgHtml = svgElement.outerHTML;
      const diagramJson = JSON.stringify({
        elements: elements,
        appState: drawApi.getAppState(),
        files: drawApi.getFiles(),
      });
      await uploadDiagram({
        id: id ?? crypto.randomUUID(),
        diagram: diagramJson,
        svg: svgHtml,
      });
    } catch (error) {
      console.error("Error exporting to SVG:", error);
    }
  }

  return (
    <>
      {(data || !id) && (
        <div className="canvas h-[500px]">
          <Excalidraw
            initialData={{
              elements: data?.elements,
              appState: data?.appState,
              files: data?.files,
            }}
            excalidrawAPI={(api) => setDrawApi(api)}
          />
        </div>
      )}
      <div className="mt-2">
        <button
          onClick={handleClick}
          disabled={!drawApi}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Export to SVG
        </button>
      </div>
    </>
  );
}

// Example url: "https://example.com/diagram/12345.svg"
function getIdFromDiagramUrl(diagramUrl: string): string {
  const urlParts = diagramUrl.split("/");
  const id = urlParts[urlParts.length - 1].split(".")[0]; // Get the last part before the file extension
  return id;
}
