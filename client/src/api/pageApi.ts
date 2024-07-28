export interface PageResponse {
    content: string;
}

export function getPage(pageId: string) {
    return fetch(`/page/${pageId}`).then((res) => res.json()).then((data: PageResponse) => data.content);
}

export interface PageRequest {
    id: number;
    parentID: number;
    url: string;
    title: string;
    shortDesc: string;
    content: string;
}

export function createPage(page: PageRequest) {
    return fetch(`/admin/pages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    }).then((res) => res.json());
}

export function updatePage(page: PageRequest) {
    return fetch(`/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
    }).then((res) => res.json());
}

export function deletePage(id: number) {
    return fetch(`/admin/pages/${id}`, {
        method: 'DELETE',
    }).then((res) => res.json());
}