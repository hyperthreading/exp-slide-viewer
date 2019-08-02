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
import PdfViewer, { PdfViewerHandle } from "./PdfViewer";

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

  const [showSlide, setShowSlide] = useState(true);
  const [showDoc, setShowDoc] = useState(true);
  const [focus, setFocus] = useState(0);

  const onFocusSlide = useCallback(() => {
    console.log("1");
    setFocus(1);
  }, []);
  const onFocusDoc = useCallback(() => {
    console.log("2");
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

  return (
    <div className={styles.mainContainer}>
      <PdfViewer
        ref={slideViewerRef}
        highlights={slideHighlights}
        file={DEFAULT_URL}
        style={{ flex: 1, display: showSlide ? "initial" : "none" }}
        onFocus={onFocusSlide}
        onBlur={onBlur}
      />
      <PdfViewer
        ref={docViewerRef}
        highlights={docHighlights}
        file={DEFAULT_URL_DOC}
        style={{ flex: 1, display: showDoc ? "initial" : "none" }}
        onFocus={onFocusDoc}
        onBlur={onBlur}
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
