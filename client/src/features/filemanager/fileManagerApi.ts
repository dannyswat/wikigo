import { baseApiUrl } from "../../common/baseApi";

export interface FileItem {
    name: string;
    path: string;
    isDir: boolean;
    size?: number;
    extension?: string;
}

export interface ListFilesResponse {
    files: FileItem[];
    currentPath: string;
}

export interface ReadFileResponse {
    content: string;
    fileName: string;
    path: string;
}

export async function listFiles(path: string = "/"): Promise<ListFilesResponse> {
    const res = await fetch(`${baseApiUrl}/editor/files/list?path=${encodeURIComponent(path)}`, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error(`Failed to list files: ${res.statusText}`);
    }

    return await res.json();
}

export async function readFile(fileName: string, path: string = "/"): Promise<ReadFileResponse> {
    const res = await fetch(`${baseApiUrl}/editor/files/read?fileName=${encodeURIComponent(fileName)}&path=${encodeURIComponent(path)}`, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error(`Failed to read file: ${res.statusText}`);
    }

    return await res.json();
}

export async function getFileInfo(fileName: string, path: string = "/"): Promise<FileItem> {
    const res = await fetch(`${baseApiUrl}/editor/files/info?fileName=${encodeURIComponent(fileName)}&path=${encodeURIComponent(path)}`, {
        credentials: 'include',
    });

    if (!res.ok) {
        throw new Error(`Failed to get file info: ${res.statusText}`);
    }

    return await res.json();
}
