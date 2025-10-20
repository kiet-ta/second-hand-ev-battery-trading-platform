import { ClassicEditor } from "ckeditor5";
import { editorPlugins } from "./plugins";
import { editorToolbar } from "./toolbar";

export const editorConfig = {
  licenseKey: "GPL",
  plugins: editorPlugins,
  toolbar: editorToolbar,
  initialData: "<p>Hello from CKEditor 5!</p>",

  autosave: {
    waitingTime: 5000,
    save(editor) {
      const data = editor.getData();
      console.log("Autosave triggered:", data);
    },
  },

  indentBlock: {
    offset: 1,
    unit: "em",
  },

  findAndReplace: {
    uiType: "dropdown",
  },

  fullscreen: {
    menuBar: { isVisible: false },
  },

  image: {
    insert: {
      integrations: ["upload", "assetManager", "url"],
      type: "auto",
    },
    toolbar: [
      "imageStyle:block",
      "imageStyle:side",
      "|",
      "toggleImageCaption",
      "imageTextAlternative",
      "|",
      "linkImage",
    ],
  },
};

export { ClassicEditor };
