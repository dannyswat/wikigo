import { useQuery } from "@tanstack/react-query";

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
    readonly?: boolean;
}

export function PageDropDown({ readonly, ...props }: Props) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['pages'],
        queryFn: async () => {
            const response = await fetch('/api/pages');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }
    });
    return <select {...props}
        disabled={readonly}
        aria-placeholder={isLoading ? 'Loading...' : (isError ? 'ERROR!' : 'Please select')}>
        {isLoading && <option>Loading...</option>}
        {isError && <option>Error!</option>}
        {data && data.map((page: { id: number, title: string }) => <option key={page.id} value={page.id}>{page.title}</option>)}
    </select>;
}