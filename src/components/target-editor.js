import Editor from "./editor";
export default class TargetEditor extends Editor {
  markupChanges = () => {
    super.markupChanges();
    let index = 0;
    this.parsedSections.forEach(({ target, lines }) => {
      const collapseLine =
        target === "source" || target === this.props.target ? false : true;
      this.editor.markText(
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
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.document !== this.props.document) {
      nextProps.document.on("change", this.markupChanges);
      this.editor.swapDoc(nextProps.document.linkedDoc({ sharedHist: true }));
      this.markupChanges();
    }
  }
}
