import React, {
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";

type IFrameAttr = React.DetailedHTMLProps<
  HTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>;

type ArrowOpt = "left" | "right";

interface Props {
  file: string;
  highlights: Highlight[];
  onFocus: OnFocus;
  onBlur: OnBlur;
  onClickHighlight: OnClickHighlight;
  arrow: ArrowOpt;
}

type BasicHandler = () => void;
type OnFocus = BasicHandler;
type OnBlur = BasicHandler;

export type OnClickHighlight = (h: Highlight) => void;

export interface PdfViewerHandle {
  focus: () => void;
  scrollToHighlight: (id: string) => void;
}

const PdfViewer: React.RefForwardingComponent<
  PdfViewerHandle,
  Props & IFrameAttr
> = (
  { file, highlights, arrow, onFocus, onBlur, onClickHighlight, ...props },
  ref
) => {
  const iframe = useRef<HTMLIFrameElement>(null);
  const scriptLoaded = usePdfViewerLoadingState(iframe)[1];

  useImperativeHandle(ref, () => ({
    focus: () => {
      iframe.current &&
        iframe.current.contentWindow &&
        scriptLoaded &&
        iframe.current.contentWindow.postMessage({ type: "focus" }, "*");
    },
    scrollToHighlight: (id: string) => {
      iframe.current &&
      iframe.current.contentWindow &&
      scriptLoaded &&
      iframe.current.contentWindow.postMessage(
        { type: "scrollToHighlight", payload: id },
        "*"
      );
    }
  }));

  useEffect(() => {
    if (!scriptLoaded) return;
    doHighlightsEffect(iframe, highlights);
  }, [highlights, scriptLoaded]);

  useEffect(() => {
    if (!scriptLoaded) return;
    doHighlightOptionsEffect(iframe, arrow);
  }, [arrow, scriptLoaded]);

  useEffect(() => {
    return doMessageHandlerEffect(iframe, onFocus, onBlur, onClickHighlight);
  }, [onFocus, onBlur, onClickHighlight]);

  return (
    <iframe
      {...props}
      frameBorder="0"
      ref={iframe}
      src={"http://localhost:1234/pdf.js/web/viewer.html?file=" + file}
    />
  );
};

const doMessageHandlerEffect = (
  iframe: React.RefObject<HTMLIFrameElement>,
  onFocus: OnFocus,
  onBlur: OnBlur,
  onClickHighlight: OnClickHighlight
) => {
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
      case "clickHighlight":
        onClickHighlight(action.payload);
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

const doHighlightOptionsEffect = (
  iframe: React.RefObject<HTMLIFrameElement>,
  arrow: ArrowOpt
) => {
  if (!iframe.current || !iframe.current.contentWindow) return;

  iframe.current.contentWindow.postMessage(
    {
      type: "setHighlightOptions",
      payload: {
        arrow
      }
    },
    "*"
  );
};

// TODO:: 코드 단순화
// Task 분할이 필요 이상으로 복잡하다.
// 사용자는 ScriptLoading만 알면 되므로, 훨씬 단순하게 만들 수 있음

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

export default React.forwardRef(PdfViewer);
