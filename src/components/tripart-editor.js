import React, {useContext} from 'react'
import OpenFilesContext from '../context/open-files';

import Editor from "./editor"

import parse from "../util/parse";
function markupSource (editor, props) {
  for (let mark of editor.getAllMarks()) {
    mark.clear();
  }
  let index = 0;

  parse(props.document.getValue()).forEach(({ target, lines }) => {
    editor.markText(
      { line: index, ch: 0 },
      {
        line: index + lines.length - 1,
        ch: lines[lines.length - 1].length
      },
      {
        className: `target-${target}`
      }
    );
    index += lines.length;
  });
}

function markupTarget (editor, props) {
  for (let mark of editor.getAllMarks()) {
    mark.clear();
  }
  let index = 0;

  parse(props.document.getValue()).forEach(({ target, lines }) => {

  const collapseLine =
    target === "source" || target === props.target ? false : true;
    editor.markText(
      { line: index, ch: 0 },
      {
        line: index + lines.length - 1,
        ch: lines[lines.length - 1].length
      },
      {
        className: `target-${target}`,
        collapsed: collapseLine,
        atomic: collapseLine,
        inclusiveLeft: collapseLine,
        inclusiveRight: collapseLine
      }
    );
    index += lines.length;
  });
}

export default function TripartEditor (props) {
  const [{openFiles, activeFile, buffers}, dispatchOpenFiles] = useContext(OpenFilesContext)

  if (!(activeFile && buffers[activeFile.name])) return null

  const {source, startingPoint, solution} = buffers[activeFile.name]

  return <>
    <Editor
      id="source"
      document={source}
      markupContent={markupSource}
      key={`source:${activeFile.name}`}
      title="Source"
    />
    <Editor
      id="starting-point"
      key={`starting-point:${activeFile.name}`}
      markupContent={markupTarget}
      document={startingPoint}
      target="starting-point"
      title="Starting Point"
    />
    <Editor
      id="solution"
      document={solution}
      markupContent={markupTarget}
      key={`solution:${activeFile.name}`}
      target="solution"
      title="Solution"
    />
  </>
}
