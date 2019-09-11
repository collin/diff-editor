import 'core-js/stable'
import 'regenerator-runtime/runtime'
import React, {useContext, useState} from "react";
import ReactDOM from "react-dom";

import fs from "./util/socket-fs";
import FileBrowser from "./components/file-browser";
import TabStrip from "./components/tab-strip";
import TripartEditor from "./components/tripart-editor";

import OpenFilesContext, { useOpenFilesReducer } from './context/open-files';

import "./styles.css";
function App() {

  const openFiles = useOpenFilesReducer()

  return (
    <OpenFilesContext.Provider
      value={openFiles}
    >
      <div className="App">
        <TabStrip/>
        <FileBrowser/>
        <TripartEditor/>
      </div>
    </OpenFilesContext.Provider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
