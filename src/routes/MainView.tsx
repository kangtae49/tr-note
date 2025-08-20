import {useEffect, useState} from "react";
import {commands} from "@/bindings.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import TreePaneView from "@/components/tree/TreePaneView.tsx";
import ContentPaneView from "@/components/ContentPaneView.tsx";

function MainView() {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <div className="main-pane">
      <SplitPane
        split="vertical"
        minSize={100}
        defaultSize={200}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
      >
        <TreePaneView />
        <ContentPaneView />
        {isResizing && <div className="iframe-overlay" />}
      </SplitPane>
    </div>
  )
}

export default MainView;
