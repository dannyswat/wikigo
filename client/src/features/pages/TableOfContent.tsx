import { useEffect, useState } from 'react';

interface Heading {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentProps {
    title: string;
    content: string;
}

export default function TableOfContent({ title, content }: TableOfContentProps) {
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        // Parse the HTML content to extract headings
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const headingElements = doc.querySelectorAll('h1, h2, h3, h4');

        const extractedHeadings: Heading[] = Array.from(headingElements).map((heading, index) => {
            const text = heading.textContent || '';
            const level = parseInt(heading.tagName.charAt(1));
            // Generate an ID if it doesn't exist
            let id = heading.id;
            if (!id) {
                id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
                heading.id = id;
            }

            return { id, text, level };
        });

        // Adjust levels if no h1 exists - treat h2 as level 1, h3 as level 2
        const hasH1 = extractedHeadings.some(heading => heading.level === 1);
        const hasH2 = extractedHeadings.some(heading => heading.level === 2);
        const adjust = (hasH1 ? 0 : 1) + (hasH2 ? 0 : 1);
        const adjustedHeadings = extractedHeadings.map(heading => ({
            ...heading,
            level: hasH1 ? heading.level : heading.level - adjust
        }));

        setHeadings(adjustedHeadings);

        // Update the actual DOM elements with IDs for navigation
        const ckContent = document.querySelector('.ck-content');
        if (ckContent) {
            const realHeadings = ckContent.querySelectorAll('h1, h2, h3, h4');
            realHeadings.forEach((heading, index) => {
                if (!heading.id && extractedHeadings[index]) {
                    heading.id = extractedHeadings[index].id;
                }
            });
        }
    }, [content]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (headings.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg sticky top-4">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {title || 'Table of Contents'}
                </h4>
            </div>
            <nav className="p-4">
                <ul className="space-y-1">
                    {headings.map(({ id, text, level }) => (
                        <li key={id}>
                            <button
                                onClick={() => scrollToHeading(id)}
                                className={`block w-full py-1 text-left text-sm/4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-700 dark:text-gray-300 ${level === 1 ? 'ps-0' : level === 2 ? 'ps-4' : level === 3 ? 'ps-8' : level === 4 ? 'ps-12' : 'ps-0'
                                    }`}
                            >
                                {text}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
