export default function parse(text) {
  const linesIn = text.split("\n");
  const sections = [];

  let prevSection = null;
  let inSection = null;
  let section = [];

  linesIn.forEach((line, lineIndex) => {
    const matchBegin = line.match(/^BEGIN>>>(.+)/);
    if (!inSection && matchBegin) {
      inSection = matchBegin[1].trim();
      if (section.length) {
        sections.push({ target: prevSection || "source", lines: section });
      }
      sections.push({ target: "directive-begin", lines: [line] });
      section = [];
      return;
    }

    const matchEnd = line.match(new RegExp(`__END>>> ?${inSection}`));
    if (inSection && matchEnd) {
      inSection = null;
      if (section.length > 0) {
        sections.push({ target: prevSection || "source", lines: section });
      }
      sections.push({ target: "directive-end", lines: [line] });
      section = [];
      return;
    }

    section.push(line);
    prevSection = inSection;
  });

  if (section.length > 0) {
    sections.push({ target: prevSection || "source", lines: section });
  }
  return sections;
}
