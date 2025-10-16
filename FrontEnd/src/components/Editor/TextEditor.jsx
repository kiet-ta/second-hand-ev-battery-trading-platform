import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, editorConfig } from "./config/editorConfig";
import useAutoSave from "./hooks/useAutoSave";
import "ckeditor5/ckeditor5.css";

function TextEditor() {
  const [editorData, setEditorData] = useState("");

  const handleChange = (event, editor) => {
    const data = editor.getData();
    setEditorData(data);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //mock data test
      body: JSON.stringify({
        userId: 1, 
        authorId: 1,
        title: "New blog post",
        category: "News",
        summary: "This is a test summary",
        thumbnailUrl: "https://example.com/thumb.jpg",
        content: editorData,
        tags: "update,news"
      }),
    });
      if (res.ok) {
        console.log("Saved:", await res.json());
      } else {
        console.error("Save failed:", await res.json());
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save content.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <CKEditor editor={ClassicEditor} onChange={handleChange} />
      <button
        onClick={handleSubmit}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Enter
      </button>
    </div>
  );
}

export default TextEditor;
