import ContentHeadView from "@/components/ContentHeadView.tsx";
import ContentView from "@/components/ContentView.tsx";
import {SplitPane} from "@rexxars/react-split-pane";
import {useState} from "react";
import TabView from "@/components/tab/TabView.tsx";
import {useIsResizingStore} from "@/stores/isResizingStore.ts";

function ContentPaneView() {
  const {setIsResizing} = useIsResizingStore()

  return (
    <div className="content-pane">
      <SplitPane
        split="horizontal"
        // primary="first"
        minSize={0}
        defaultSize={54}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
      >
        <TabView />
        <ContentView />
      </SplitPane>
    </div>
  )
}
      // <MdView />

export default ContentPaneView;
