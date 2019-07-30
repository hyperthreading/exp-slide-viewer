import React, {
  createRef,
  HTMLAttributes,
  useEffect,
  useRef,
  useState
} from "react";
import { Simulate } from "react-dom/test-utils";
import load = Simulate.load;
import Timeout = NodeJS.Timeout;

const HOST = "http://localhost:1234";

const DEFAULT_RESOURCE_PATH = HOST + "/public/prompt";

const DEFAULT_URL = DEFAULT_RESOURCE_PATH + "/slide.pdf";
const DEFAULT_URL_DOC = DEFAULT_RESOURCE_PATH + "/doc.pdf";

const App: React.FC = () => {
  const [slideHighlights, setSlideHighlights] = useState([]);
  const [docHighlights, setDocHighlights] = useState([]);
  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(DEFAULT_RESOURCE_PATH + "/slide.json").then(r => r.json()),
      fetch(DEFAULT_RESOURCE_PATH + "/doc.json").then(r => r.json()),
      fetch(DEFAULT_RESOURCE_PATH + "/mapping.json").then(r => r.json())
    ]).then(([slideHighlights, docHighlights, mappings]) => {
      setSlideHighlights(slideHighlights);
      setDocHighlights(docHighlights);
      setMappings(mappings);
    });
  }, []);

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <PdfViewer
        highlights={slideHighlights}
        file={DEFAULT_URL}
        style={{ flex: 1 }}
      />
      <PdfViewer
        highlights={docHighlights}
        file={DEFAULT_URL_DOC}
        style={{ flex: 1 }}
      />
    </div>
  );
};

export default App;

type IFrameAttr = React.DetailedHTMLProps<
  HTMLAttributes<HTMLIFrameElement>,
  HTMLIFrameElement
>;

type PdfViewerProps = { file: string; highlights: Highlight[] } & IFrameAttr;

const PdfViewer: React.FC<PdfViewerProps> = ({
  file,
  highlights,
  ...props
}) => {
  const iframe = useRef<HTMLIFrameElement>(null);

  useUpdateHighlights(iframe, highlights);

  return (
    <iframe
      {...props}
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
const useUpdateHighlights = (
  iframe: React.RefObject<HTMLIFrameElement>,
  highlights: Highlight[]
) => {
  const [_, loadingState] = useWaitPdfViewerLoading(iframe);

  useEffect(() => {
    if (!loadingState.script) return;
    if (!iframe.current || !iframe.current.contentWindow) return;

    iframe.current.contentWindow.postMessage(
      {
        type: "setHighlights",
        payload: highlights
      },
      "*"
    );
  }, [iframe, highlights, loadingState]);
};

const useWaitPdfViewerLoading = (
  iframe: React.RefObject<HTMLIFrameElement>
) => {
  const [pingInterval, setPingInterval] = useState<Timeout | null>(null);

  const [loadingState, setLoadingState] = useState({
    iframe: false,
    handler: false,
    script: false
  });

  const someAreNotLoaded = Object.values(loadingState).some(_ => !_);
  if (someAreNotLoaded) {
    // check stuffs

    if (!loadingState.iframe) {
      let me = setInterval(() => {
        if (!iframe.current || !iframe.current.contentWindow) {
          return loadingState;
        }
        clearInterval(me);
        setLoadingState(loadingState => ({ ...loadingState, iframe: true }));
      }, 66);
    } else if (!pingInterval) {
      const handleMessage = (e: MessageEvent) => {
        if (!iframe.current || e.source !== iframe.current.contentWindow)
          return;

        setLoadingState(loadingState => ({ ...loadingState, script: true }));
      };

      window.addEventListener("message", handleMessage);

      let intervalId = setInterval(() => {
        if (!iframe.current || !iframe.current.contentWindow) return;
        iframe.current.contentWindow.postMessage({ type: "register" }, "*");
      }, 66);

      setPingInterval(intervalId);
    }
  } else if (pingInterval) {
    clearInterval(pingInterval);
    setPingInterval(null);
  }

  return [pingInterval, loadingState] as [
    typeof pingInterval,
    typeof loadingState
  ];
};