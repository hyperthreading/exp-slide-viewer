import React, {
  createRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import styles from "./App.module.css";
import ToolbarItem from "./ToolbarItem";
import PdfViewer, { OnClickHighlight, PdfViewerHandle } from "./PdfViewer";

const HOST = "http://localhost:1234";
const DEFAULT_RESOURCE_PATH = HOST + "/public/prompt";

const DEFAULT_URL = DEFAULT_RESOURCE_PATH + "/slide.pdf";
const DEFAULT_URL_DOC = DEFAULT_RESOURCE_PATH + "/doc.pdf";

const App: React.FC = () => {
  const [slideHighlights, setSlideHighlights] = useState<Highlight[]>([]);
  const [docHighlights, setDocHighlights] = useState<Highlight[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);

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

  const [showSlide, setShowSlide] = useState(true);
  const [showDoc, setShowDoc] = useState(true);
  const [focus, setFocus] = useState(0);

  const onFocusSlide = useCallback(() => {
    setFocus(1);
  }, []);
  const onFocusDoc = useCallback(() => {
    setFocus(2);
  }, []);
  const onBlur = useCallback(() => setFocus(0), []);

  const slideViewerRef = useRef<PdfViewerHandle>(null);
  const docViewerRef = useRef<PdfViewerHandle>(null);
  useEffect(() => {
    // ensure focusing changes
    if (focus === 1 && slideViewerRef.current) slideViewerRef.current.focus();
  }, [focus]);
  useEffect(() => {
    // ensure focusing changes
    if (focus === 2 && docViewerRef.current) docViewerRef.current.focus();
  }, [focus]);

  const onClickSlideToggle = useCallback(() => {
    setShowSlide(b => !b);
    if (!showSlide) setFocus(1);
  }, [showSlide]);
  const onClickDocumentToggle = useCallback(() => {
    setShowDoc(b => !b);
    if (!showDoc) setFocus(2);
  }, [showDoc]);

  const onClickHighlightSlide = useCallback<OnClickHighlight>(
    h => {
      const map = mappings.find(
        ([slideHighlightId, _]) => slideHighlightId === h.id
      );

      if (!(map && docViewerRef.current)) return;

      docViewerRef.current.scrollToHighlight(map[1]);
      setShowDoc(true);
    },
    [mappings]
  );

  const onClickHighlightDoc = useCallback<OnClickHighlight>(
    h => {
      const map = mappings.find(
        ([_, docHighlightId]) => docHighlightId === h.id
      );

      if (!(map && slideViewerRef.current)) return;

      slideViewerRef.current.scrollToHighlight(map[0]);
      setShowSlide(true);
    },
    [mappings]
  );

  return (
    <div className={styles.mainContainer}>
      <PdfViewer
        ref={slideViewerRef}
        highlights={slideHighlights}
        arrow="right"
        file={DEFAULT_URL}
        style={{ flex: 1, display: showSlide ? "initial" : "none" }}
        onFocus={onFocusSlide}
        onBlur={onBlur}
        onClickHighlight={onClickHighlightSlide}
      />
      <PdfViewer
        ref={docViewerRef}
        highlights={docHighlights}
        arrow="left"
        file={DEFAULT_URL_DOC}
        style={{ flex: 1, display: showDoc ? "initial" : "none" }}
        onFocus={onFocusDoc}
        onBlur={onBlur}
        onClickHighlight={onClickHighlightDoc}
      />
      <div className={styles.toolbar}>
        <ToolbarItem
          onClick={onClickSlideToggle}
          selected={showSlide}
          focused={focus === 1}
        >
          Slide
        </ToolbarItem>
        <ToolbarItem
          onClick={onClickDocumentToggle}
          selected={showDoc}
          focused={focus === 2}
        >
          Document
        </ToolbarItem>
      </div>
    </div>
  );
};

export default App;
