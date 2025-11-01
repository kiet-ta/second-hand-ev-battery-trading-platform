import { useCallback } from "react";

export default function useAutoSave() {
  const save = useCallback((data) => {
    console.log("Saving to server:", data);
    // return fetch("/api/save", { method: "POST", body: JSON.stringify({ data }) });
  }, []);

  return { save };
}
