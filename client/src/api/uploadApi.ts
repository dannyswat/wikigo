export interface UploadDiagramRequest {
  id: string;
  diagram: string;
  svg: string;
}

export interface UploadDiagramResponse {
  id: string;
  diagramSvgUrl: string;
}

export async function uploadDiagram(
  request: UploadDiagramRequest
): Promise<UploadDiagramResponse> {
  const res = await fetch("/api/upload/diagram", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error("Failed to upload diagram");
  }
  const data = await res.json();
  return data;
}
