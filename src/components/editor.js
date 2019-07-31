import React from "react";
import CodeMirror from "codemirror/lib/codemirror";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/fold/xml-fold";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

import parse from "../util/parse";

export default class Editor extends React.Component {
  editorElement = React.createRef();

  componentDidMount() {
    this.editor = CodeMirror(this.editorElement.current, {
      ...this.props.editorConfig,
      mode: "text/html",
      theme: "default",
      matchTags: { bothTags: true },
      autoCloseTags: true,
      tabSize: 2,
      lineNumbers: true
    });
    if (this.props.setDocument) {
      this.props.setDocument(this.editor.getDoc());
    }
  }
  markupChanges() {
    for (let mark of this.editor.getDoc().getAllMarks()) {
      mark.clear();
    }
  }
  get parsedSections() {
    return parse(this.editor.getValue());
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const {
      title,
      source = [],
      onChange = () => {},
      editorConfig,
      changeSource,
      setDocument,
      document,
      ...otherProps
    } = this.props;
    return (
      <div className="editor-pane" {...otherProps}>
        <code className="title">{title}</code>
        <div className="editor-container" ref={this.editorElement} />
      </div>
    );
  }
}
