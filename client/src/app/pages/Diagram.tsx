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
import { createPortal } from "react-dom";

interface Diagram {
  elements: NonDeletedExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles;
}

interface DiagramModalProps {
  diagramUrl: string;
  onClose: (imageUrl: string) => void;
}

export default function DiagramModal({
  diagramUrl,
  onClose,
}: DiagramModalProps) {
  const [drawApi, setDrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [id, setId] = useState(() =>
    diagramUrl ? getIdFromDiagramUrl(diagramUrl) : undefined
  );
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
    enabled: !!id,
    staleTime: 0,
  });

  function handleClose() {
    if (drawApi) {
      drawApi.resetScene();
    }
    onClose(`/media/diagrams/${id}.svg`);
  }

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
      const result = await uploadDiagram({
        id: id ?? crypto.randomUUID(),
        diagram: diagramJson,
        svg: svgHtml,
      });
      setId(result.id);
      onClose(result.diagramSvgUrl);
    } catch (error) {
      console.error("Error exporting to SVG:", error);
    }
  }

  return createPortal(
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white p-4 z-[10100]">
      {(data || !id) && (
        <div className="canvas w-full h-full">
          <Excalidraw
            initialData={{
              elements: data?.elements,
              files: data?.files,
            }}
            excalidrawAPI={(api) => {
              setDrawApi(api);
              api.resetScene();
            }}
          />
        </div>
      )}
      <div className="mt-2">
        <button
          onClick={handleClick}
          disabled={!drawApi}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Save
        </button>
        <button
          onClick={handleClose}
          className="ms-3 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

// Example url: "https://example.com/diagram/12345.svg"
function getIdFromDiagramUrl(diagramUrl: string): string {
  const urlParts = diagramUrl.split("/");
  const id = urlParts[urlParts.length - 1].split(".")[0]; // Get the last part before the file extension
  return id;
}
