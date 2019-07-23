// @flow

import React, { Component } from "react";

import URLSearchParams from "url-search-params";

import testHighlights from "./test-highlights";

import Sidebar from "./Sidebar";

import type { T_Highlight, T_NewHighlight } from "../../src/types";

import "./style/App.css";
import PdfViewer from "./PdfViewer";
import { copyToClipboard } from "./util";

type T_ManuscriptHighlight = T_Highlight;

type Props = {};

type State = {
  highlights: Array<T_ManuscriptHighlight>
};

const DEFAULT_URL = "http://localhost:8080/CHI18-prompting-slide.pdf";
const DEFAULT_URL_DOC = "http://localhost:8080/CHI2018-Prompting.pdf";

const searchParams = new URLSearchParams(location.search);
const url = searchParams.get("url") || DEFAULT_URL;

class App extends Component<Props, State> {
  state = {
    highlights: [],
    highlights2: [],
    mappings: [],
    highlightTextForSlide: "",
    highlightTextForDoc: ""
  };

  state: State;

  render() {
    const {
      highlights,
      highlights2,
      mappings,
      highlightTextForSlide,
      highlightTextForDoc
    } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div>
            <button
              onClick={() => {
                const text = JSON.stringify(highlights, undefined, 4);
                copyToClipboard(text);
                this.setState({ highlightTextForSlide: text });
              }}
            >
              Export Highlights
            </button>
            <button
              onClick={() => {
                this.setState({
                  highlights: JSON.parse(highlightTextForSlide)
                });
              }}
            >
              Import Highlights
            </button>
            <textarea
              value={highlightTextForSlide}
              onChange={e =>
                this.setState({ highlightTextForSlide: e.target.value })
              }
            />
            <textarea
              onChange={e =>
                this.setState({ mappings: JSON.parse(e.target.value) })
              }
            />
          </div>
          <div style={{ display: "flex", flex: 1 }}>
            <Sidebar
              highlights={highlights}
              onHighlightClick={highlight => {
                console.log("asd");
                this.refs.slideViewer.scrollViewerTo(highlight);
              }}
            />
            <PdfViewer
              ref="slideViewer"
              highlights={highlights}
              onHighlightChange={highlights =>
                this.setState({ highlights: highlights })
              }
              onHighlightClick={id => {
                const mapping = mappings.find(([slideId, _]) => slideId === id);
                if (!mapping) return;
                console.log("jump!");
                const docHighlightId = mapping[1];
                const docHighlight = this.state.highlights2.find(
                  h => h.id === docHighlightId
                );
                if (!docHighlight) return;
                this.refs.docViewer.scrollViewerTo(docHighlight);
                console.log("jump!!");
              }}
              builderMode={false}
              url={DEFAULT_URL}
            />
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div>
            <button
              onClick={() => {
                const text = JSON.stringify(highlights2, undefined, 4);
                copyToClipboard(text);
                this.setState({ highlightTextForDoc: text });
              }}
            >
              Export Highlights
            </button>
            <button
              onClick={() => {
                this.setState({
                  highlights2: JSON.parse(highlightTextForDoc)
                });
              }}
            >
              Import Highlights
            </button>
            <textarea
              value={highlightTextForDoc}
              onChange={e =>
                this.setState({ highlightTextForDoc: e.target.value })
              }
            />
            <textarea
              onChange={e =>
                this.setState({ mappings: JSON.parse(e.target.value) })
              }
            />
          </div>
          <PdfViewer
            ref="docViewer"
            highlights={highlights2}
            onHighlightChange={highlights =>
              this.setState({ highlights2: highlights })
            }
            builderMode={true}
            url={DEFAULT_URL_DOC}
          />
        </div>
      </div>
    );
  }
}

export default App;
