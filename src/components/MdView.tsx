import React, {useState} from "react";
import MDEditor from '@uiw/react-md-editor';

function MdView() {
  const [value, setValue] = useState<string | undefined>("**Hello world!!!**");
  return (
    <div className="md-view">
      <MDEditor
        value={value}
        onChange={setValue}
        preview='live'
        height="100%"
      />
      <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
    </div>
  )
}

export default MdView;


