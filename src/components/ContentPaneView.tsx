import ContentHeadView from "@/components/ContentHeadView.tsx";
import ContentView from "@/components/ContentView.tsx";
import {SplitPane} from "@rexxars/react-split-pane";
import {useState} from "react";

function ContentPaneView() {
  const [isResizing, setIsResizing] = useState(false);
  return (
    <div className="content-pane">
      <SplitPane
        split="horizontal"
        // primary="first"
        minSize={80}
        defaultSize={80}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
      >
        <ContentHeadView />
        <ContentView />
      </SplitPane>
    </div>
  )
}
      // <MdView />

export default ContentPaneView;
