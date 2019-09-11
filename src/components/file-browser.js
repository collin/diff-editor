import React, {useEffect, useState, useContext} from "react";
import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
import socketFs from "../util/socket-fs"
import OpenFilesContext, {openFile, switchFile, setFileContent} from '../context/open-files'

function basename (path) {
  const segments  = path.split("/")
  return segments[segments.length - 1]
}

function File (props) {
  const [
    { openFiles, activeFileName },
    dispatchOpenFiles
  ] = useContext(OpenFilesContext)

  async function openOrActivateFile () {
    const index = openFiles.findIndex(file => file.name === props.stat.name)
    if (index === -1) {
      dispatchOpenFiles(openFile(props.stat))
      const fileContent = await socketFs.readfile(props.stat.name)
      dispatchOpenFiles(setFileContent(props.stat, fileContent))
    }
    else {
      dispatchOpenFiles(switchFile(props.stat))
    }

  }

  return (
    <label
      className="file-browser-label"
      onClick={openOrActivateFile}
    >
      <img
        className="file-browser-icon"
        src={`/icons/${getIconForFile(props.stat.name)}`}
      />
      {basename(props.stat.name)}
    </label>
  )
}

function fileStatSorter (a, b) {
  if (a.isDir === b.isDir) {
    if (a.name > b.name) return 1
    else if (b.name > a.name) return -1
    else return 0
  }
  else if (a.isDir) return -1
  else if (b.isDir) return 1
}

function Directory (props) {
  const [children, setChildren] = useState([])
  const [error, setError] = useState()

  useEffect(() => {
    async function readDirItems () {
      try {
        const dirItems = await socketFs.readdir(props.path)
        dirItems.sort(fileStatSorter)
        setChildren(dirItems)
      }
      catch (error) {
        console.error("Error reading directory: ", props.path, this)
        console.error(error)
        setError(error)
      }
    }
    readDirItems()
  }, props.path)

  return (
    <div className="file-browser">
      <label className="file-browser-label">
        <img
          className="file-browser-icon"
          src={`/icons/${getIconForFolder(props.stat.name)}`}
        />
        {basename(props.stat.name)}
      </label>
      <ul className="file-browser-list">
        {children.map(child => {
          if (child.isDir) {
            return (
              <li key={`${child.name}`} className="file-browser-item">
                <Directory path={`./${child.name}`} stat={child}/>
              </li>
            )
          }
          else {
            return (
              <li key={`${child.name}`} className="file-broswer-item">
                <File path={`${child.name}`} stat={child}/>
              </li>
            )
          }
        })}
      </ul>
    </div>
  )
}

export default function FileBrowser (props) {
  return <Directory path="." stat={{name: ''}}/>
}

