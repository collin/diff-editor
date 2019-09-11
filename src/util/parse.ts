type Target = (
  | "source"
  | "directive-begin"
  | "directive-end"
  | "starting-point"
  | "solution"
)

interface Section {
  target: Target,
  lines: string[]
}

type InputProgram = string

type Lines = string[]

function isTarget (userInput: string): userInput is Target {
  return /^starting-point|solution$/.test(userInput as Target)
}

export default function parse(text: InputProgram): Section[] {
  const linesIn: Lines = text.split("\n");
  const sections: Section[] = [];

  let prevSection: Target = null;
  let inSection: Target = null;
  let lines: Lines = [];

  linesIn.forEach((line, lineIndex) => {
    const matchBegin = line.match(/^BEGIN>>> ?(.+)/);
    if (!inSection && matchBegin) {
      const userInput = matchBegin[1].trim()
      if (isTarget(userInput)) {
        inSection = userInput

        if (lines.length) {
          sections.push({ target: prevSection || "source", lines });
        }
        sections.push({ target: "directive-begin", lines: [line] });
        lines = [];
        return;
      }
    }

    const matchEnd = line.match(new RegExp(`__END>>> ?${inSection}$`));
    if (inSection && matchEnd) {
      inSection = null;
      if (lines.length > 0) {
        sections.push({ target: prevSection || "source", lines });
      }
      sections.push({ target: "directive-end", lines: [line] });
      lines = [];
      return;
    }

    lines.push(line);
    prevSection = inSection;
  });

  if (lines.length > 0) {
    sections.push({ target: prevSection || "source", lines });
  }
  return sections;
}
