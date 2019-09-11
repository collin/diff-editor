import React, { useContext, useState, useEffect } from 'react'
import OpenFilesContext, {switchFile, closeFile} from '../context/open-files'
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
import classnames from 'classnames'

function TabStripItem ({file}) {
  const [isClean, setIsClean] = useState(true)
  const [{ openFiles, activeFile, buffers }, dispatchOpenFiles] = useContext(OpenFilesContext)

  useEffect(() => {
    function changeHandler (doc, change) {
      if (change.origin != 'setValue') {
        setIsClean(buffers[file.name].source.isClean())
      }
    }
    buffers[file.name].source.on("change", changeHandler)
  }, [])

  const classNames = classnames("tab-strip-item", {
    "tab-strip-item-active": activeFile.name === file.name
  })

  function switchToFile (event) {
    dispatchOpenFiles(switchFile(file))
  }
  function closeThisFile (event) {
    dispatchOpenFiles(closeFile(file))
  }

  return (
    <div
      key={file.name}
      className={classNames}
      onClick={switchToFile}
    >
      <button
        className="tab-strip-close"
        onClick={closeThisFile}
      >
        <span>&times;</span>
    </button>
      <img
        className="file-browser-icon"
        src={`/icons/${getIconForFile(file.name)}`}
      />
      {file.name}
      {isClean ? '[.]' : '[*]'}
    </div>
  )
}


export default function TabStrip (props) {
  const [{ openFiles, activeFile, buffers }, dispatchOpenFiles] = useContext(OpenFilesContext)
  return (
    <div className="tab-strip">
      {openFiles.map(file =>
        <TabStripItem key={file.name} file={file}/>
      )}
    </div>
  )
}
