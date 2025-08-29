import React, {useEffect, useRef} from "react";
import * as monaco from 'monaco-editor'
import {editor} from 'monaco-editor'
import Editor, {OnMount} from '@monaco-editor/react';
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {getMonacoLanguage} from "@/components/content.ts";
import {TreeItem} from "@/components/tree/tree.ts";
import {useFileContent} from "@/stores/contentsStore.ts";
import {useTab} from "@/components/tab/stores/tabItemsStore.ts";
import {getTabFromTreeItem} from "@/components/tab/tab.ts";
import {useSaveFile} from "@/components/utils.ts";
import {useFileSavedContent} from "@/stores/savedContentsStore.ts";
import {useFileViewTypeGroupStore} from "@/stores/fileViewTypeGroupStore.ts";
import {useEditorPos} from "@/stores/editorPosStore.ts";
import ScrollType = editor.ScrollType;
import {ErrorBoundary} from "react-error-boundary";

interface Props {
  style?: React.CSSProperties
  selectedItem?: TreeItem
  fullscreenHandler?: (e: any) => Promise<void>
}

function MonacoView({ style, selectedItem, fullscreenHandler }: Props): React.ReactElement {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const http = useHttp();
  const {content, setContent} = useFileContent<string | undefined>(selectedItem?.full_path);
  const {setSavedContent} = useFileSavedContent<string | undefined>(selectedItem?.full_path);
  const {saveFile} = useSaveFile();
  const {addTab} = useTab();
  const {fileViewTypeGroup} = useFileViewTypeGroupStore();
  const {editorPos, setEditorPos} = useEditorPos(selectedItem?.full_path);
  const readonly = fileViewTypeGroup === 'GroupBinarySmall' || fileViewTypeGroup === 'GroupBinary';

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
    addTab(getTabFromTreeItem(selectedItem))
  }

  if (http != undefined && selectedItem != undefined && content == undefined) {
    http.getSrcText(selectedItem.full_path).then(text => {
      console.log('getSrcText monaco');
      setContent(text);
      setSavedContent(text);
    })
  }

  return (
    <div className="monaco-view"
         style={style}
         tabIndex={0}
         onKeyDownCapture={fullscreenHandler}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <Editor
                value={content}
                defaultLanguage={getMonacoLanguage(selectedItem?.ext)}
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
