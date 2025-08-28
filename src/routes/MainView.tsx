import {SplitPane} from "@rexxars/react-split-pane";
import TreePaneView from "@/components/tree/TreePaneView.tsx";
import ContentPaneView from "@/components/ContentPaneView.tsx";
import {useIsResizingStore} from "@/stores/isResizingStore.ts";

function MainView() {
  const {isResizing, setIsResizing} = useIsResizingStore()

  return (
    <div className="main-pane">
      <SplitPane
        split="vertical"
        minSize={0}
        defaultSize={200}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
      >
        <TreePaneView />
        <ContentPaneView />
      </SplitPane>
      {isResizing && <div className="iframe-overlay" onClick={() => setIsResizing(false)} />}
    </div>
  )
}

export default MainView;
