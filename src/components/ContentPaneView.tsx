import TabView from "@/components/tab/TabView.tsx";
import ContentHeadView from "@/components/ContentHeadView.tsx";
import ContentView from "@/components/ContentView.tsx";

function ContentPaneView() {
  return (
    <div className="content-pane">
      <ContentHeadView />
      <TabView />
      <ContentView />
    </div>
  )
}
      // <MdView />

export default ContentPaneView;
