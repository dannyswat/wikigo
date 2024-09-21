import { baseApiUrl } from "./baseApi";

export interface PageResponse {
    id: number;
    parentId: number | null;
    url: string;
    title: string;
    shortDesc: string;
    content: string;
    isPinned: boolean;
    isProtected: boolean;
}

export interface PageMeta {
    id: number;
    parentId: number | null;
    url: string;
    title: string;
}

export function getPage(pageId: string): Promise<PageResponse> {
    return fetch(baseApiUrl + `/page/${pageId}`).then((res) => res.json());
}

export async function getPageByUrl(url: string): Promise<PageResponse> {
    const res = await fetch(baseApiUrl + `/page/url/${url}`,
        { credentials: 'include' }
    );
    return await res.json();
}

export async function getAllPages(): Promise<PageMeta[]> {
    const res = await fetch(baseApiUrl + `/pages/listall`, {
        credentials: 'include',
    });
    return await res.json();
}

export function getRootPages(): Promise<PageMeta[]> {
    return fetch(baseApiUrl + `/pages/list`).then((res) => res.json());
}

export interface PageRequest {
    id: number;
    parentID?: number;
    url: string;
    title: string;
    shortDesc: string;
    content: string;
    isPinned: boolean;
    isProtected: boolean;
}

export async function createPage(page: PageRequest) {
    const res = await fetch(baseApiUrl + `/admin/pages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    });

    if (res.status >= 400) {
        throw new Error(await res.text());
    }

    return await res.json();
}

export async function updatePage(page: PageRequest) {
    const res = await fetch(baseApiUrl + `/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    });
    if (res.status >= 400) {
        throw new Error(await res.text());
    }
    return await res.json();
}

export async function deletePage(id: number) {
    const res = await fetch(baseApiUrl + `/admin/pages/${id}`, {
        method: 'DELETE',
    });
    if (res.status >= 400) {
        throw new Error(await res.text());
    }
    return await res.json();
}