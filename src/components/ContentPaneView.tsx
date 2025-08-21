import MdView from "@/components/MdView.tsx";
import TabView from "@/components/tab/TabView.tsx";
import ContentHeadView from "@/components/ContentHeadView.tsx";

function ContentPaneView() {
  return (
    <div className="content-pane">
      <ContentHeadView />
      <TabView />
    </div>
  )
}
      // <MdView />

export default ContentPaneView;
