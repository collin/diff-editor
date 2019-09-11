import CodeMirror from "codemirror/lib/codemirror"
import mime from 'mime'
import { createContext, useReducer, useEffect } from 'react'
import { produce } from 'immer'

window.CodeMirror = CodeMirror
export const OPEN_FILE = 'OPEN_FILE'
export const CLOSE_FILE = 'CLOSE_FILE'
export const SWITCH_FILE = 'SWITCH_FILE'
export const SET_FILE_CONTENT = 'SET_FILE_CONTENT'

export const openFile = (file) => ({ type: OPEN_FILE, file })
export const closeFile = (file) => ({ type: CLOSE_FILE, file })
export const switchFile = (file) => ({ type: SWITCH_FILE, file })
export const setFileContent = (file, fileContent) => ({
  type: SET_FILE_CONTENT,
  file,
  fileContent
})

export const initialState = {
  openFiles: [],
  activeFile: null,
  buffers: {}
}


const JS = "application/javascript"
const SPECIAL_NAMES = {
  ".babelrc": JS,
  ".eslintrc": JS
}
function resolveMode (name) {
  const parts = name.split(new RegExp("/"))
  const filename = parts[parts.length - 1 ]
  if (SPECIAL_NAMES[filename]) {
    return SPECIAL_NAMES[filename]
  }
  return mime.getType(filename) || undefined
}

const openFilesReducer = (state, action) => produce(state, (draft) => {
  switch (action.type) {
    case OPEN_FILE:
      draft.openFiles.push(action.file)
      const buffers = {}

      buffers.source = new CodeMirror.Doc("", resolveMode(action.file.name))
      buffers.source.file = action.file
      buffers.startingPoint = buffers.source.linkedDoc({ sharedHist: true })
      buffers.solution = buffers.source.linkedDoc({ sharedHist: true })

      draft.buffers[action.file.name] = buffers
      draft.activeFile = action.file
      break
    case CLOSE_FILE:
      if (state.activeFile.name === action.file.name) {
        const nextfile = state.openFiles.find(aFile => aFile.name != state.activeFile.name)
        if (nextfile) {
          draft.activeFile = nextfile
        }
      }
      delete draft.buffers[action.file.name]
      draft.openFiles.splice(
        draft.openFiles.findIndex(file => file.name === action.file.name),
        1
      )
      break
    case SWITCH_FILE:
      draft.activeFile = action.file
      break
    case SET_FILE_CONTENT:
      // this is a VERY NAUGHTY state mutation in the reducer. Sorry....
      // but CodeMirror is doing its own command pattern internally
      // :man-shrugging:
      state.buffers[action.file.name].source.setValue(action.fileContent)
      state.buffers[action.file.name].source.clearHistory()
      state.buffers[action.file.name].source.markClean()
      break
    }
})

const logger = (reducer) => {
  const reducerWithLogger = (state, action) => {
    console.groupCollapsed("%cDispatch", "color: #00A717, font-weight 700;", action.type, action);
    console.log("%cAction:", "color: #00A7F7; font-weight: 700;", action);
    console.log("%cPrevious State:", "color: #9E9E9E; font-weight: 700;", state);
    console.log("%cNext State:", "color: #47B04B; font-weight: 700;", reducer(state,action));
    console.groupEnd("%cDispatch", "color: #00A717; font-weight 700;", action.type);
    const nextState = reducer(state, action);
    return nextState
  };
  return reducerWithLogger;
}

const loggedReducer = logger(openFilesReducer)

export const useOpenFilesReducer = () =>
  useReducer(loggedReducer, initialState)

export default createContext()
