/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plugin, ButtonView } from 'ckeditor5';

export class ImageBrowser extends Plugin {
    init() {
        const editor = this.editor;

        // Add the image browser button to the toolbar
        editor.ui.componentFactory.add('imageBrowser', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Browse Images',
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.972 16.615a.997.997 0 0 1-.744-.292l-4.596-4.596a1 1 0 0 1 0-1.414l4.596-4.596a1 1 0 0 1 1.414 0l4.596 4.596a1 1 0 0 1 0 1.414l-4.596 4.596a.997.997 0 0 1-.67.292zm-3.182-5.595L7.695 15.2l3.905-3.905L7.695 7.39 3.79 11.02z"/>
                    <path d="M13 7h5v6h-5V7zm1 1v4h3V8h-3z"/>
                    <rect x="2" y="2" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/>
                    <path d="M14 14l-3.5-3.5-2.5 2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>`,
                tooltip: true
            });

            // Execute command when button is clicked
            view.on('execute', () => {
                editor.fire('openImageBrowserModal');
            });

            return view;
        });
    }
}
