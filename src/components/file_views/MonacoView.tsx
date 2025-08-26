import React, {useEffect, useRef} from "react";
import * as monaco from 'monaco-editor'
import Editor, {OnMount} from '@monaco-editor/react';
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {getMonacoLanguage} from "@/components/content.ts";
import {useSaveFile} from "@/components/utils.ts";
import {TreeItem} from "@/components/tree/tree.ts";
import {useFileContent} from "@/stores/contentsStore.ts";


self.MonacoEnvironment = {
  getWorkerUrl(_moduleId, label) {
    const basePath = ''
    if (label === 'json') {
      return `${basePath}/monaco-editor/esm/vs/language/json/json.worker.js`
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return `${basePath}/monaco-editor/esm/vs/language/css/css.worker.js`
    }
    if (label === 'html' || label === 'handlebars') {
      return `${basePath}/monaco-editor/esm/vs/language/html/html.worker.js`
    }
    if (label === 'typescript' || label === 'javascript') {
      return `${basePath}/monaco-editor/esm/vs/language/typescript/ts.worker.js`
    }
    return `${basePath}/monaco-editor/esm/vs/editor/editor.worker.js`
  }
}


interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

function MonacoView({ style, selectedItem, fullscreenHandler }: Props): React.ReactElement {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const http = useHttp();
  const {content, setContent} = useFileContent<string | undefined>(selectedItem?.full_path);

  const {saveFile} = useSaveFile();

  const onChangeContent = (value: string | undefined) => {
    if (value == undefined) return;
    setContent(value);
  }

  useEffect(() => {
  }, []);


  useEffect(() => {
    if (http == undefined) return;
    if (selectedItem == undefined) return;
    if (content == undefined) {
      http.getSrcText(selectedItem.full_path).then(text => {
        setContent(text);
      });
    }
  }, [selectedItem])


  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor;
    editor.onKeyDown((e) => {
      if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const text = editor.getValue();
        const pos = editor.getPosition();
        if (text !== undefined && content !== text) {
          saveFile(text).then((_item) => {
            console.log('saveFile done');
            setTimeout(() => {
              if (pos) {
                monacoEditorRef.current?.focus();
                monacoEditorRef.current?.setPosition(pos);
              }
            }, 1000);
          });
        }
      }
    });
  };

  return (
    <div className="monaco-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <Editor
              value={content}
              defaultLanguage={getMonacoLanguage(selectedItem?.ext)}
              theme="vs"
              onMount={handleEditorDidMount}
              onChange={ onChangeContent }
      />
    </div>
  )
}

export default MonacoView;
