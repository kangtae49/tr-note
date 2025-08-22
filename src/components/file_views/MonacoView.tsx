import React, {useEffect, useRef, useState} from "react";
import * as monaco from 'monaco-editor'
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useSelectedTreeItemStore} from "@/components/tree/stores/selectedTreeItemStore.ts";
import {getMonacoLanguage} from "@/components/utils.ts";

self.MonacoEnvironment = {
  getWorkerUrl(_, label) {
    const basePath = '.'
    if (label === 'json') {
      return `${basePath}/monaco-editor/esm/vs/language/json/json.worker.js`
    }
    if (label === 'css') {
      return `${basePath}/monaco-editor/esm/vs/language/css/css.worker.js`
    }
    if (label === 'html') {
      return `${basePath}/monaco-editor/esm/vs/language/html/html.worker.js`
    }
    if (label === 'typescript' || label === 'javascript') {
      return `${basePath}/monaco-editor/esm/vs/language/typescript/ts.worker.js`
    }
    return `${basePath}/monaco-editor/esm/vs/editor/editor.worker.js`
  }
}

function MonacoView(): React.ReactElement {
  const selectedItem = useSelectedTreeItemStore((state) => state.selectedItem)
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const http = useHttp();
  const [content, setContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    http.getSrcText(selectedItem.full_path).then(text => {
      setContent(text);
    });
  }, [selectedItem])

  useEffect(() => {
    if (selectedItem && content && editorRef && editorRef.current) {
      if (monacoEditorRef?.current) {
        monacoEditorRef.current.dispose()
      }
      monacoEditorRef.current = monaco.editor.create(editorRef.current, {
        // model,
        value: content,
        // language: 'plaintext',
        language: getMonacoLanguage(selectedItem?.ext),
        theme: 'vs',
        readOnly: true,
        automaticLayout: true,
        scrollBeyondLastLine: false
      })
    }
  }, [content, selectedItem]);

  return (
    <div className="monaco-view" ref={editorRef} />
  )
}

export default MonacoView;
