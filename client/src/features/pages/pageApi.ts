import { baseApiUrl } from "../../common/baseApi";

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

interface RevisionPageResponse {
    id: number;
    recordId: number;
    insertDate: string;
    record: PageResponse;
}

export interface PageMeta {
    id: number;
    parentId: number | null;
    url: string;
    title: string;
    isPinned: boolean;
    isProtected: boolean;
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

export async function getLatestPageRevisionByUrl(id: number): Promise<RevisionPageResponse> {
    const res = await fetch(baseApiUrl + `/editor/pagerevision/${id}`,
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

export async function searchPages(query: string): Promise<PageMeta[]> {
    const res = await fetch(baseApiUrl + `/pages/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
    });
    if (res.status >= 400) {
        throw new Error(await res.text());
    }
    return await res.json();
}

export interface PageRequest {
    id: number;
    parentId: number | null;
    url: string;
    title: string;
    shortDesc: string;
    content: string;
    isPinned: boolean;
    isProtected: boolean;
}

export async function createPage(page: PageRequest) {
    const res = await fetch(baseApiUrl + `/editor/pages`, {
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
    const res = await fetch(baseApiUrl + `/editor/pages/${page.id}`, {
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
    const res = await fetch(baseApiUrl + `/editor/pages/${id}`, {
        method: 'DELETE',
    });
    if (res.status >= 400) {
        throw new Error(await res.text());
    }
    return await res.json();
}

export async function rebuildSearchIndex() {
    const res = await fetch(baseApiUrl + `/admin/pages/rebuildsearch`, {
        method: 'POST',
    });
    if (res.status >= 400) {
        throw new Error(await res.text());
    }
    return await res.json();
}