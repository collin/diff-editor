import React from "react";
import ReactDOM from "react-dom";

import SourceEditor from "./components/source-editor";
import TargetEditor from "./components/target-editor";

import "./styles.css";

function App() {
  const [document, setDocument] = React.useState();
  const [source, setSource] = React.useState("");

  function handleChange(value) {
    // FIXME: this is terribly ineficient, but whatevs
    // this prevents infinite update loops, which are worse for performance ;)
    if (value === source) {
      return;
    }
    setSource(value);
  }
  React.useEffect(() => {
    handleChange(`\
<!doctype html>
<html>
  <head>
BEGIN>>> starting-point
    <!-- put some header content here -->
    <title>Put your own page title here</title>
__END>>> starting-point
BEGIN>>> solution
    <title>Page title</title>
    <meta charset="UTF-8">
__END>>> solution
  </head>
  <body>
BEGIN>>> starting-point
    <!-- Place your page content here. -->
__END>>> starting-point
BEGIN>>> solution
    <h1>Welcome to my awesome page :D</h1>
__END>>> solution
  </body>
</html>`);
  }, []);

  return (
    <div className="App">
      <SourceEditor
        id="source"
        text={source}
        setDocument={setDocument}
        title="Source"
      />
      <TargetEditor
        id="starting-point"
        document={document}
        target="starting-point"
        title="Starting Point"
      />
      <TargetEditor
        id="solution"
        document={document}
        target="solution"
        title="Solution"
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
