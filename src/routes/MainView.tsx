import {useState} from "react";
import {SplitPane} from "@rexxars/react-split-pane";
import TreePaneView from "@/components/tree/TreePaneView.tsx";
import ContentPaneView from "@/components/ContentPaneView.tsx";

function MainView() {
  const [isResizing, setIsResizing] = useState(false);

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
      {isResizing && <div className="iframe-overlay" />}
    </div>
  )
}

export default MainView;
