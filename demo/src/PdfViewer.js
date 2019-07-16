import React, { Component } from "react";
import testHighlights from "./test-highlights";
import type { T_NewHighlight } from "../../src/types";
import {
  AreaHighlight,
  Highlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  Tip
} from "../../src";
import Spinner from "./Spinner";
import { copyToClipboard } from "./util";

const HighlightPopup = ({ comment }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null;

const getNextId = () => String(Math.random()).slice(2);

export default class PdfViewer extends Component {
  scrollViewerTo = (highlight: any) => {};

  getHighlightById(id: string) {
    const { highlights } = this.props;

    return highlights.find(highlight => highlight.id === id);
  }

  addHighlight(highlight: T_NewHighlight) {
    const { highlights } = this.props;

    console.log("Saving highlight", highlight);

    this.props.onHighlightChange([
      { ...highlight, id: getNextId() },
      ...highlights
    ]);
  }

  updateHighlight(highlightId: string, position: Object, content: Object) {
    console.log("Updating highlight", highlightId, position, content);

    this.props.onHighlightChange(
      this.props.highlights.map(h => {
        return h.id === highlightId
          ? {
              ...h,
              position: { ...h.position, ...position },
              content: { ...h.content, ...content }
            }
          : h;
      })
    );
  }

  render() {
    const { highlights, url, builderMode, onHighlightClick } = this.props;

    return (
      <div
        style={{
          flex: 1,
          overflowY: "scroll",
          position: "relative"
        }}
      >
        <PdfLoader url={url} beforeLoad={<Spinner />}>
          {pdfDocument => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={event => event.altKey}
              scrollRef={scrollTo => {
                this.scrollViewerTo = scrollTo;

                // this.scrollToHighlightFromHash();
              }}
              onSelectionFinished={(
                position,
                content,
                hideTipAndSelection,
                transformSelection
              ) => {
                return (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={comment => {
                      this.addHighlight({ content, position, comment });

                      hideTipAndSelection();
                    }}
                  />
                );
              }}
              highlightTransform={(
                highlight,
                index,
                setTip,
                hideTip,
                viewportToScaled,
                screenshot,
                isScrolledTo
              ) => {
                const isTextHighlight = !Boolean(
                  highlight.content && highlight.content.image
                );

                const clickFunc = builderMode
                  ? () => copyToClipboard(`"${highlight.id}"`)
                  : () => onHighlightClick(highlight.id);

                const component = isTextHighlight ? (
                  <Highlight
                    isScrolledTo={isScrolledTo}
                    position={highlight.position}
                    comment={highlight.comment}
                    onClick={clickFunc}
                  />
                ) : (
                  <AreaHighlight
                    highlight={highlight}
                    onClick={clickFunc}
                    onChange={boundingRect => {
                      this.updateHighlight(
                        highlight.id,
                        { boundingRect: viewportToScaled(boundingRect) },
                        { image: screenshot(boundingRect) }
                      );
                    }}
                  />
                );

                return (
                  <Popup
                    popupContent={<HighlightPopup {...highlight} />}
                    onMouseOver={popupContent =>
                      setTip(highlight, highlight => popupContent)
                    }
                    onMouseOut={hideTip}
                    key={index}
                    children={component}
                  />
                );
              }}
              highlights={highlights}
            />
          )}
        </PdfLoader>
      </div>
    );
  }
}
