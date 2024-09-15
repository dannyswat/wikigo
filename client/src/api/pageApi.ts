import { baseApiUrl } from "./baseApi";

export interface PageResponse {
    id: number;
    parentID: number;
    url: string;
    title: string;
    shortDesc: string;
    content: string;
}

export interface PageMeta {
    id: number;
    url: string;
    title: string;
}

export function getPage(pageId: string): Promise<PageResponse> {
    return fetch(baseApiUrl + `/page/${pageId}`).then((res) => res.json());
}

export function getPageByUrl(url: string): Promise<PageResponse> {
    return fetch(baseApiUrl + `/page/url/${url}`).then((res) => res.json());
}

export function getAllPages(): Promise<PageMeta[]> {
    return fetch(baseApiUrl + `/pages/listall`).then((res) => res.json());
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
}

export function createPage(page: PageRequest) {
    return fetch(baseApiUrl + `/admin/pages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    }).then((res) => res.json());
}

export function updatePage(page: PageRequest) {
    return fetch(baseApiUrl + `/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    }).then((res) => res.json());
}

export function deletePage(id: number) {
    return fetch(baseApiUrl + `/admin/pages/${id}`, {
        method: 'DELETE',
    }).then((res) => res.json());
}