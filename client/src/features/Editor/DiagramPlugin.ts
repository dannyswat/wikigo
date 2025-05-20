import { Plugin } from "ckeditor5";
import { ButtonView } from "ckeditor5";
import diagramIcon from "../../assets/diagram.svg?raw"; // You'll need to create an icon

export default class DiagramPlugin extends Plugin {
  static get pluginName() {
    return "DiagramPlugin";
  }

  init() {
    const editor = this.editor;
    const t = editor.t;

    editor.ui.componentFactory.add("diagramPlugin", (locale) => {
      const view = new ButtonView(locale);

      view.set({
        label: t("Insert/Update Diagram"),
        icon: diagramIcon,
        tooltip: true,
      });

      // Callback executed once the image is clicked.
      this.listenTo(view, "execute", () => {
        const element = editor.model.document.selection.getSelectedElement();
        if (element) {
          const src = element.getAttribute("src");
          if (src && typeof src === "string" && src.endsWith(".svg")) {
            editor.fire("openDiagramModal", src);
            return;
          }
        }
        editor.fire("openDiagramModal");
      });

      return view;
    });
  }
}
