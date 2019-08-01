import React, {
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type IFrameAttr = React.DetailedHTMLProps<
  HTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>;

interface Props {
  file: string;
  highlights: Highlight[];
  onFocus: OnFocus;
  onBlur: OnBlur;
}

type OnFocus = () => void;
type OnBlur = () => void;

const PdfViewer: React.FC<Props & IFrameAttr> = ({
  file,
  highlights,
  onFocus,
  onBlur,
  ...props
}) => {
  const iframe = useRef<HTMLIFrameElement>(null);

  const scriptLoaded = usePdfViewerLoadingState(iframe)[1];

  useEffect(() => {
    if (!scriptLoaded) return;
    doHighlightsEffect(iframe, highlights);
  }, [highlights, scriptLoaded]);

  useEffect(() => {
    if (!iframe.current) return;
    return doMessageHandlerEffect(iframe, onFocus, onBlur);
  }, [onFocus, onBlur]);

  return (
    <iframe
      {...props}
      frameBorder="0"
      ref={iframe}
      src={"http://localhost:1234/pdf.js/web/viewer.html?file=" + file}
    />
  );
};

/*
  postMessage가 제대로 전달되는 것을 보장하려면, 로딩이 될 때까지 기다릴 수 있는 수단이 필요하다.
  1. human sol - 버튼 사용
  2. scheduler (or timer) 이용
  */

const doMessageHandlerEffect = (iframe: React.RefObject<HTMLIFrameElement>, onFocus: OnFocus, onBlur: OnBlur) => {
  const handler = (e: MessageEvent) => {
    // we should handle messages about this iframe
    if (!iframe.current || e.source !== iframe.current.contentWindow) {
      return;
    }

    const action = e.data as { type: string; payload: any };
    switch (action.type) {
      case "focus":
        onFocus();
        break;
      case "blur":
        onBlur();
        break;
      default:
    }
  };
  window.addEventListener("message", handler);

  return () => window.removeEventListener("message", handler);
};

const doHighlightsEffect = (
  iframe: React.RefObject<HTMLIFrameElement>,
  highlights: Highlight[]
) => {
  if (!iframe.current || !iframe.current.contentWindow) return;

  iframe.current.contentWindow.postMessage(
    {
      type: "setHighlights",
      payload: highlights
    },
    "*"
  );
};

const usePdfViewerLoadingState = (
  iframe: React.RefObject<HTMLIFrameElement>
) => {
  const [pingInterval, setPingInterval] = useState<number | null>(null);

  const [iframeLoading, setIframeLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  const someAreNotLoaded = !(iframeLoading && scriptLoading);
  if (someAreNotLoaded) {
    // check stuffs

    if (!iframeLoading) {
      let me = setInterval(() => {
        if (!iframe.current || !iframe.current.contentWindow) {
          return;
        }
        clearInterval(me);
        setIframeLoading(true);
      }, 66);
    } else if (!pingInterval) {
      const handleMessage = (e: MessageEvent) => {
        if (!iframe.current || e.source !== iframe.current.contentWindow)
          return;

        setScriptLoading(true);
      };
      window.addEventListener("message", handleMessage);
      let intervalId = window.setInterval(() => {
        if (!iframe.current || !iframe.current.contentWindow) return;
        iframe.current.contentWindow.postMessage({ type: "register" }, "*");
      }, 66);

      setPingInterval(intervalId);
    }
  }
  if (!someAreNotLoaded && pingInterval) {
    clearInterval(pingInterval);
    setPingInterval(null);
  }

  return [iframeLoading, scriptLoading] as [boolean, boolean];
};

export default PdfViewer;
