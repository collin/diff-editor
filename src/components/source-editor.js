import Editor from "./editor";
export default class SourceEditor extends Editor {
  markupChanges = () => {
    super.markupChanges();
    let index = 0;
    this.parsedSections.forEach(({ target, lines }) => {
      this.editor.markText(
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
  };
  componentDidMount() {
    super.componentDidMount();
    this.editor.getDoc().on("change", this.markupChanges);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.text && nextProps.text !== this.editor.getValue()) {
      this.editor.setValue(nextProps.text);
      this.editor.clearHistory();
    }
  }
}
