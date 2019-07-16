// @flow

import React from "react";

import type { T_Highlight } from "../../src/types";
type T_ManuscriptHighlight = T_Highlight;

type Props = {
  highlights: Array<T_ManuscriptHighlight>,
  onHighlightClick: T_ManuscriptHighlight => void,
  resetHighlights: () => void
};

const updateHash = highlight => {
  location.hash = `highlight-${highlight.id}`;
};

function Sidebar({ highlights, onHighlightClick, resetHighlights }: Props) {
  return (
    <div className="sidebar" style={{ width: "10vw" }}>

      <ul className="sidebar__highlights">
        {highlights.map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              onHighlightClick(highlight);
            }}
          >
            <div>
              <strong>{highlight.comment.text}</strong>
              {highlight.content.text ? (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              ) : null}
              {highlight.content.image ? (
                <div
                  className="highlight__image"
                  style={{ marginTop: "0.5rem" }}
                >
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber}
            </div>
          </li>
        ))}
      </ul>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          <a href="#" onClick={resetHighlights}>
            Reset highlights
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default Sidebar;
