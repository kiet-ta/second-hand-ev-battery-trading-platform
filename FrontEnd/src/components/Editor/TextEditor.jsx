import { CKEditor } from "@ckeditor/ckeditor5-react";
// Assuming the path is correct:
import { ClassicEditor, editorConfig } from "./config/editorConfig"; 
import "ckeditor5/ckeditor5.css";
import React, { useState, useEffect, useRef } from "react";

function TextEditor({ initialContent = "", onContentChange }) {
    const [editorData, setEditorData] = useState(initialContent);
    const editorRef = useRef(null); 

    // 1. Reset content when parent state changes (e.g., after successful post)
    useEffect(() => {
        if (editorData !== initialContent) {
             setEditorData(initialContent);
        }
    }, [initialContent]);

    // 2. CRITICAL FIX: Cleanup function for Strict Mode
    useEffect(() => {
        // This function runs when the component is unmounted (including the first time in Strict Mode)
        return () => {
            // Check if the editor instance exists and destroy it gracefully
            if (editorRef.current && editorRef.current.editor) {
                try {
                    editorRef.current.editor.destroy();
                    editorRef.current = null;
                    console.log("CKEditor instance destroyed by cleanup.");
                } catch (error) {
                    // This try/catch handles cases where CKEditor is already destroyed
                }
            }
        };
    }, []); // Empty dependency array ensures it runs only on mount and unmount

    const handleChange = (event, editor) => {
        const data = editor.getData();
        setEditorData(data); 
        onContentChange(data);
    };
    
    const handleReady = (editor) => {
        editorRef.current = editor;
        console.log("CKEditor instance is ready.");
    };

    return (
        <div className="text-editor-container">
            <CKEditor 
                editor={ClassicEditor} 
                config={editorConfig} 
                data={editorData} 
                onChange={handleChange} 
                onReady={handleReady} 
            />
        </div>
    );
}

export default TextEditor;