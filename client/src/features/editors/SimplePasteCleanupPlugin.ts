import { Plugin } from "ckeditor5";

/**
 * A simple paste cleanup plugin that removes unwanted formatting and attributes
 * from pasted content to maintain consistent styling in your editor.
 */
export class SimplePasteCleanup extends Plugin {
    static get pluginName() {
        return "SimplePasteCleanup";
    }

    init() {
        const editor = this.editor;

        // Hook into the clipboard input processing pipeline
        this.listenTo(editor.plugins.get('ClipboardPipeline'), 'inputTransformation', (evt, data) => {
            console.log('SimplePasteCleanup: Processing pasted content');
            if (data.dataTransfer) {
                const htmlData = data.dataTransfer.getData('text/html');
                if (htmlData) {
                    const cleanedHtml = this.cleanHtmlContent(htmlData);
                    data.content = editor.data.processor.toView(cleanedHtml);
                }
            }
        }, { priority: 'high' });
    }

    /**
     * Main cleaning function that processes the HTML content
     */
    private cleanHtmlContent(htmlString: string): string {
        // Create a temporary container to parse and manipulate the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        // Apply cleaning operations
        this.removeUnwantedElements(tempDiv);
        this.cleanAttributes(tempDiv);
        this.cleanInlineStyles(tempDiv);
        this.cleanLinks(tempDiv);
        this.normalizeWhitespace(tempDiv);
        this.removeEmptyElements(tempDiv);
        this.removeStrongInHeader(tempDiv);

        return tempDiv.innerHTML;
    }

    /**
     * Remove potentially dangerous or unwanted HTML elements
     */
    private removeUnwantedElements(container: HTMLElement) {
        const unwantedElements = [
            'script', 'style', 'meta', 'link', 'object', 'embed',
            'applet', 'iframe', 'frame', 'frameset', 'form', 'input',
            'button', 'textarea', 'select', 'option'
        ];

        unwantedElements.forEach(tagName => {
            const elements = container.querySelectorAll(tagName);
            elements.forEach(el => el.remove());
        });
    }

    /**
     * Remove unwanted attributes from all elements
     */
    private cleanAttributes(container: HTMLElement) {
        const allElements = container.querySelectorAll('*');

        // Allowed attributes for specific elements
        const allowedAttributes: { [key: string]: string[] } = {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            'table': ['border', 'cellpadding', 'cellspacing'],
            'td': ['colspan', 'rowspan'],
            'th': ['colspan', 'rowspan'],
            'ol': ['start', 'type'],
            'ul': ['type'],
        };

        allElements.forEach(element => {
            const tagName = element.tagName.toLowerCase();
            const allowed = allowedAttributes[tagName] || [];

            // Get all current attributes
            const attributesToRemove: string[] = [];

            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                const attrName = attr.name.toLowerCase();

                // Remove if not in allowed list or if it's a commonly unwanted attribute
                if (!allowed.includes(attrName) || this.isUnwantedAttribute(attrName)) {
                    attributesToRemove.push(attrName);
                }
            }

            // Remove unwanted attributes
            attributesToRemove.forEach(attrName => {
                element.removeAttribute(attrName);
            });
        });
    }

    /**
     * Check if an attribute should be removed
     */
    private isUnwantedAttribute(attrName: string): boolean {
        const unwantedPatterns = [
            'on', // onclick, onmouseover, etc.
            'data-', // data attributes (mostly tracking)
            'class',
            'id',
            'style', // We'll handle styles separately
            'contenteditable',
            'spellcheck',
            'draggable',
            'tabindex',
            'role',
            'aria-',
        ];

        return unwantedPatterns.some(pattern => attrName.startsWith(pattern));
    }

    /**
     * Clean inline styles, keeping only essential formatting
     */
    private cleanInlineStyles(container: HTMLElement) {
        const elementsWithStyle = container.querySelectorAll('[style]');

        // CSS properties we want to preserve
        const allowedStyles = [
            'color',
            'font-style',
            'text-decoration'
        ];

        elementsWithStyle.forEach(element => {
            const styleAttr = element.getAttribute('style');
            if (!styleAttr) return;

            // Parse and filter styles
            const styles = styleAttr.split(';')
                .map(style => style.trim())
                .filter(style => style.length > 0)
                .filter(style => {
                    const property = style.split(':')[0]?.trim().toLowerCase();
                    return allowedStyles.includes(property);
                });

            if (styles.length > 0) {
                element.setAttribute('style', styles.join('; '));
            } else {
                element.removeAttribute('style');
            }
        });
    }

    /**
     * Clean and sanitize links
     */
    private cleanLinks(container: HTMLElement) {
        const links = container.querySelectorAll('a[href]');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Remove dangerous protocols
            if (this.isDangerousUrl(href)) {
                link.removeAttribute('href');
                return;
            }

            // Clean tracking parameters from URLs
            const cleanedHref = this.removeTrackingParams(href);
            if (cleanedHref !== href) {
                link.setAttribute('href', cleanedHref);
            }

            // Add security attributes for external links
            if (this.isExternalUrl(cleanedHref)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    /**
     * Check if URL uses dangerous protocols
     */
    private isDangerousUrl(url: string): boolean {
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
        const lowerUrl = url.toLowerCase();
        return dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
    }

    /**
     * Remove tracking parameters from URLs
     */
    private removeTrackingParams(url: string): string {
        try {
            const urlObj = new URL(url);
            const trackingParams = [
                'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
                'fbclid', 'gclid', 'ref', 'source', '_hsenc', '_hsmi', 'mc_cid', 'mc_eid'
            ];

            trackingParams.forEach(param => {
                urlObj.searchParams.delete(param);
            });

            return urlObj.toString();
        } catch {
            // If URL parsing fails, return original (might be relative URL)
            return url;
        }
    }

    /**
     * Check if URL is external
     */
    private isExternalUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname !== window.location.hostname;
        } catch {
            // If URL parsing fails, assume it's internal
            return false;
        }
    }

    /**
     * Normalize whitespace in text content
     */
    private normalizeWhitespace(container: HTMLElement) {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        while (node = walker.nextNode()) {
            if (node.textContent) {
                // Replace multiple spaces with single space, but preserve line breaks
                const normalized = node.textContent
                    .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
                    .replace(/^\s+|\s+$/g, ''); // Trim leading/trailing whitespace

                if (normalized !== node.textContent) {
                    node.textContent = normalized;
                }
            }
        }
    }

    private removeStrongInHeader(container: HTMLElement) {
        const headers = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headers.forEach(header => {
            const strongElements = header.querySelectorAll('strong');
            strongElements.forEach(strong => {
                const parent = strong.parentElement;
                if (parent) {
                    // Replace <strong> with its text content
                    parent.replaceChild(document.createTextNode(strong.textContent || ''), strong);
                }
            });
        });
    }

    /**
     * Remove empty elements that don't serve a purpose
     */
    private removeEmptyElements(container: HTMLElement) {
        // Elements that should be removed if empty
        const emptyableElements = ['p', 'div', 'span', 'strong', 'em', 'b', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

        emptyableElements.forEach(tagName => {
            const elements = container.querySelectorAll(tagName);
            elements.forEach(el => {
                // Remove if no text content and no important child elements
                if (!el.textContent?.trim() && !el.querySelector('img, br, hr, table')) {
                    el.remove();
                }
            });
        });
    }
}
