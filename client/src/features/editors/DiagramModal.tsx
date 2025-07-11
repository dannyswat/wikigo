import { Excalidraw, exportToBlob, exportToSvg } from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { uploadDiagram } from "./uploadApi";
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
      const res = await fetch(`/api/editor/diagram/source/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch diagram");
      }
      const data = await res.json();
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });
  console.log(data);

  function handleClose() {
    if (drawApi) {
      drawApi.resetScene();
    }
    onClose('');
  }

  async function handleClick() {
    if (!drawApi) {
      console.error("Excalidraw API not available");
      return;
    }

    const elements = drawApi.getSceneElements();
    if (elements.length === 0) return;

    try {
      const exportSetting = {
        elements: elements,
        appState: drawApi.getAppState(),
        files: drawApi.getFiles(),
        exportPadding: 10,
        exportBackground: true, // Set to true if you want the canvas background color
      };
      const png = await exportToBlob(exportSetting);
      const pngBase64 = await getBase64DataUrlFromBlob(png);
      const svgElement: SVGSVGElement = await exportToSvg(exportSetting);
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
        png: pngBase64
      });
      setId(result.id);
      onClose(result.diagramPngUrl);
    } catch (error) {
      console.error("Error exporting to SVG:", error);
    }
  }

  return createPortal(
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 p-4 z-[10100]">
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
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-600"
        >
          Save
        </button>
        <button
          onClick={handleClose}
          className="ms-3 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

// Example url: "https://example.com/diagram/12345.svg?t=123455"
function getIdFromDiagramUrl(diagramUrl: string): string {
  const urlWithoutQuery = diagramUrl.split('?')[0];
  const urlParts = urlWithoutQuery.split("/");
  const id = urlParts[urlParts.length - 1].split(".")[0]; // Get the last part before the file extension
  return id;
}

function getBase64DataUrlFromBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}