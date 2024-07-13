export interface PageResponse {
    content: string;
}

export function getPage(pageId: string) {
    return fetch(`/api/page/${pageId}`).then((res) => res.json()).then((data: PageResponse) => data.content);
}