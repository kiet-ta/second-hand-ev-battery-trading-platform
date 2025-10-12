import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ scrollRef }) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (scrollRef && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [pathname, scrollRef]);
  return null;
}