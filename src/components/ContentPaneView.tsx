import ContentHeadView from "@/components/ContentHeadView.tsx";
import ContentView from "@/components/ContentView.tsx";
import {SplitPane} from "@rexxars/react-split-pane";
import {useState} from "react";
import TabView from "@/components/tab/TabView.tsx";

function ContentPaneView() {
  const [isResizing, setIsResizing] = useState(false);
  return (
    <div className="content-pane">
      <SplitPane
        split="horizontal"
        // primary="first"
        minSize={30}
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
