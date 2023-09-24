import { useCallback, useRef } from 'react'
import { basicSetup } from 'codemirror'
import { EditorView, MatchDecorator, Decoration, ViewPlugin } from '@codemirror/view'

export const Editor = ({ setText }) => {
  const viewRef = useRef(null)

  if (viewRef.current === null) {
    viewRef.current = new EditorView({
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        numberDecorations,
        editorTheme,
      ],
      dispatchTransactions(trs) {
        viewRef.current.update(trs)
        setText(viewRef.current.state.doc.toString())
      }
    })
  }

  const attachEditor = useCallback((element) => {
    if (element) {
      element.replaceChildren(viewRef.current.dom)
      viewRef.current.focus()
    }
  }, [])

  return <div ref={attachEditor}/>
}

const numberDecorator = new MatchDecorator({
  regexp: /^\d+\.\s/g,
  decoration: () => Decoration.mark({
    class: 'reference-number',
  })
})

const numberDecorations = ViewPlugin.fromClass(class {
  placeholders
  constructor(view) {
    this.placeholders = numberDecorator.createDeco(view)
  }
  update(update) {
    this.placeholders = numberDecorator.updateDeco(update, this.placeholders)
  }
}, {
  decorations: instance => instance.placeholders,
  provide: plugin => EditorView.atomicRanges.of(view => view.plugin(plugin)?.placeholders || Decoration.none)
})

const editorTheme = EditorView.baseTheme({
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontSize: '14px',
  },
  '.cm-gutters': {
    background: 'none',
  },
  '.cm-content': {
    fontFamily: 'system-ui',
  },
  '.reference-number': {
    backgroundColor: '#c1e8c1',
    borderRadius: '4px'
  }
})
