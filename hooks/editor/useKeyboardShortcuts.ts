"use client"

import { useEffect } from "react"

export function useKeyboardShortcuts(
  handleUndo: () => void,
  handleRedo: () => void,
  handleSave: () => void,
  handleExport: () => void,
  handleCopy: () => void,
  handleCut: () => void,
  handlePaste: () => void,
  selectAll: () => void,
  deleteSelectedPixels: () => void,
  clearSelection: () => void,
  setCurrentTool: (tool: string) => void,
  selectedPixels: { [key: string]: string }
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault()
            if (e.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
            break
          case "y":
            e.preventDefault()
            handleRedo()
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
          case "e":
            e.preventDefault()
            handleExport()
            break
          case "a":
            e.preventDefault()
            selectAll()
            break
          case "c":
            e.preventDefault()
            handleCopy()
            break
          case "x":
            e.preventDefault()
            handleCut()
            break
          case "v":
            e.preventDefault()
            if (e.ctrlKey || e.metaKey) {
              handlePaste()
            } else {
              setCurrentTool("move")
            }
            break
          case "m":
            e.preventDefault()
            setCurrentTool("select")
            break          
          case "w":
            e.preventDefault()
            setCurrentTool("magic-wand")
            break
          case "l":
            e.preventDefault()
            setCurrentTool("border-select")
            break
          case "r":
            e.preventDefault()
            setCurrentTool("rotate")
            break
        }
      }
      
      // Non-modifier key shortcuts
      switch (e.key) {
        case "Delete":
        case "Backspace":
          if (Object.keys(selectedPixels).length > 0) {
            deleteSelectedPixels()
          }
          break
        case "Escape":
          clearSelection()
          break
        case "b":
          setCurrentTool("pencil")
          break
        case "e":
          if (!(e.ctrlKey || e.metaKey)) {
            setCurrentTool("eraser")
          }
          break       
        case "l":
          if (!(e.ctrlKey || e.metaKey)) {
            setCurrentTool("line")
          }
          break
        case "u":
          setCurrentTool("rectangle")
          break
        case "o":
          setCurrentTool("circle")
          break
        case "g":
          setCurrentTool("bucket")
          break
        case "s":
          if (!(e.ctrlKey || e.metaKey)) {
            setCurrentTool("spray")
          }
          break
        case "i":
          setCurrentTool("eyedropper")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    handleUndo,
    handleRedo,
    handleSave,
    handleExport,
    handleCopy,
    handleCut,
    handlePaste,
    selectAll,
    deleteSelectedPixels,
    clearSelection,
    setCurrentTool,
    selectedPixels
  ])
}
