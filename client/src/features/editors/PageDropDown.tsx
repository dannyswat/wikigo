import React, { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAllPages } from "../pages/pageApi";
import { queryClient } from "../../common/query";
import { UserContext } from "../auth/UserProvider";
import { useTranslation } from "react-i18next";

interface Props extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
    readonly?: boolean;
    onChange: (value: number | undefined) => void;
    value?: number;
}

// eslint-disable-next-line react-refresh/only-export-components
export function clearCache() {
    queryClient.removeQueries({ queryKey: ['pages', true] });
    queryClient.removeQueries({ queryKey: ['pages', false] })
}

export function PageDropDown({ readonly, value, onChange, ...props }: Props) {
    const { t } = useTranslation();
    const { isLoggedIn } = useContext(UserContext);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['pages', isLoggedIn],
        queryFn: getAllPages,
    });
    const listItems = useMemo(() => [{ id: 0, title: t('None') }, ...(data || [])], [data, t]);
    return <select {...props} value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
        disabled={readonly}
        aria-placeholder={isLoading ? t('Loading...') : (isError ? t('ERROR!') : t('Please select'))}>
        {isLoading && <option>{t('Loading...')}</option>}
        {isError && <option>Error!</option>}
        {listItems.map((page: { id: number, title: string }) =>
            <option key={page.id} value={page.id}>{page.title}</option>)}
    </select>;
}