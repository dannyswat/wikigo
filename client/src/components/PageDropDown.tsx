import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAllPages, PageMeta } from "../api/pageApi";
import { queryClient } from "../common/query";

interface Props extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    readonly?: boolean;
    onChange: (value: number | undefined) => void;
    value?: number;
}

const pagesQueryKey = ['pages'];

// eslint-disable-next-line react-refresh/only-export-components
export function clearCache() {
    queryClient.removeQueries({ queryKey: pagesQueryKey });
}

export function PageDropDown({ readonly, value, onChange, ...props }: Props) {
    const { data, isLoading, isError } = useQuery({
        queryKey: pagesQueryKey,
        queryFn: getAllPages,
    });
    const listItems = useMemo(() => [{ id: 0, title: 'None' } as PageMeta, ...(data || [])], [data]);
    return <select {...props}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
        disabled={readonly}
        aria-placeholder={isLoading ? 'Loading...' : (isError ? 'ERROR!' : 'Please select')}>
        {isLoading && <option>Loading...</option>}
        {isError && <option>Error!</option>}
        {listItems.map((page: { id: number, title: string }) =>
            <option key={page.id} value={page.id} selected={(value ?? 0) === page.id}>{page.title}</option>)}
    </select>;
}