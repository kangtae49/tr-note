import React, {useEffect, useRef} from "react";
import * as monaco from 'monaco-editor'
import {editor} from 'monaco-editor'
import Editor, {OnMount} from '@monaco-editor/react';
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {getMonacoLanguage} from "@/components/content.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {useSaveFile} from "@/components/utils.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {useFileViewTypeGroupStore} from "@/stores/fileViewTypeGroupStore.ts";
import {useEditorPos} from "@/stores/editorPosStore.ts";
import ScrollType = editor.ScrollType;
import {ErrorBoundary} from "react-error-boundary";
import {FileViewProps} from "@/components/FileView.tsx";
import {TabItem} from "@/bindings.ts";
import {useSaveKey} from "@/stores/saveKeyStore.ts";


function MonacoView({ style, fileItem, fullscreenHandler }: FileViewProps): React.ReactElement {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const http = useHttp();
  const {content, setContent} = useFileContent<string | undefined>(fileItem?.full_path);
  const {setSavedContent} = useFileSavedContent<string | undefined>(fileItem?.full_path);
  const {saveFile} = useSaveFile();
  const {addTab} = useTab();
  const {fileViewTypeGroup} = useFileViewTypeGroupStore();
  const {editorPos, setEditorPos} = useEditorPos(fileItem?.full_path);
  const readonly = fileViewTypeGroup === 'GroupBinarySmall' || fileViewTypeGroup === 'GroupBinary';
  const {saveKey} = useSaveKey(fileItem?.full_path);

  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor;
    const position = {column: editorPos?.column || 0, lineNumber: editorPos?.lineNumber || 0};
    editorRef.current?.revealPositionInCenter(position, ScrollType.Smooth);
    editorRef.current?.setPosition(position)
    editorRef.current?.focus();


    editor.onKeyDown((e) => {
      if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const text = editor.getValue();
        const pos = editor.getPosition();
        if (text !== undefined) {
          saveFile(text).then((_item) => {
            console.log('saveFile done');
            setContent(text);
            setSavedContent(text);
            setTimeout(() => {
              if (pos) {
                editorRef.current?.focus();
                editorRef.current?.setPosition(pos);
              }
            }, 1000);
          });
        }
      }
    });

    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      console.log('onDidChangeCursorPosition', position);
      setEditorPos({column: position.column, lineNumber: position.lineNumber})
    });

  };

  const onChangeContent = (value: string | undefined, _ev: monaco.editor.IModelContentChangedEvent) => {
    if (readonly) return;
    if (value == undefined) return;
    console.log('onChange monaco')
    setContent(value);
    addTab(fileItem as TabItem)
  }

  if (http != undefined && fileItem != undefined && content == undefined) {
    http.getSrcText(fileItem.full_path).then(text => {
      console.log('getSrcText monaco');
      setContent(text);
      setSavedContent(text);
      editorRef.current?.setPosition({lineNumber: 0, column: 0})
    })
  }



  return (
    <div className="monaco-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Editor
          key={`${fileItem?.full_path}_${saveKey}`}
          value={content}
          defaultLanguage={getMonacoLanguage(fileItem?.ext ?? '')}
          theme="vs"
          options={{ readOnly: readonly }}
          onMount={handleEditorDidMount}
          onChange={ onChangeContent }
        />
      </ErrorBoundary>
    </div>
  )
}

export default MonacoView;
