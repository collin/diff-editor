import React, {createRef, useEffect} from "react"

import CodeMirror from "codemirror/lib/codemirror";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/fold/xml-fold";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import socketFs from "../util/socket-fs"

CodeMirror.commands.save = function ({ doc }) {
  (async () =>{
    try {
      await socketFs.writefile(doc.file.name, doc.getValue())
      // TODO: find way to trigger clean event
      //setIsClean(true)
    }
    catch (error) {
      console.error(error)
      alert("Error while saving file!")
    }
  }).call()
}

export default function SourceEditor (props) {
  const editor = createRef(null)
  const editorElement = createRef(null)

  useEffect(() => {
    if (!props.document) return
    function markupContent () {
      props.markupContent(editor.current, props)
    }

    if (!editor.current) {
      editor.current = CodeMirror(editorElement.current, {
        //...props.editorConfig,
        mode: "application/javascript",
        //theme: "default",
        //matchTags: { bothTags: true },
        //autoCloseTags: true,
        tabSize: 2,
        lineNumbers: true
      });
    }

    editor.current.swapDoc(props.document)
    props.document.on("change", markupContent)
    markupContent()
    return () => {
      editor.current.swapDoc(new CodeMirror.Doc(""))
      props.document.off("change", markupContent)
    }
  }, [props.document])

  const {
    title,
    editorConfig,
    document,
    markupContent,
    ...otherProps
  } = props;

  return (
    <div className="editor-pane" {...otherProps}>
      <code className="title">{title}</code>
      <div className="editor-container" ref={editorElement} />
    </div>
  );
}
