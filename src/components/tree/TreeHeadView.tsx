import {useEffect, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faInbox,
  faHouseUser,
  faDownload,
  faFileWord,
  faVideo,
  faMusic,
  faImage,
  faDesktop
} from '@fortawesome/free-solid-svg-icons'
import {HomePathMap, useRenderTreeFromPath} from "@/components/tree/tree.ts";
import {commands} from "@/bindings.ts";

function TreeHeadView() {

  const {renderTreeFromPath} = useRenderTreeFromPath();

  const [homeDir, setHomeDir] = useState<HomePathMap>({
    HomeDir: '',
    DesktopDir: '',
    PictureDir: '',
    AudioDir: '',
    VideoDir: '',
    DocumentDir: '',
    DownloadDir: '',
    CacheDir: '',
    ConfigDir: '',
    DataDir: '',
    DataLocalDir: '',
    ExecutableDir: '',
    FontDir: '',
    PublicDir: '',
    RootDir: '',
    RuntimeDir: '',
    TemplateDir: ''
  })
  const clickHomeDir = async (fullPath: string): Promise<void> => {
    await renderTreeFromPath(fullPath)
  }

  useEffect(() => {
    const fetchHomes = async (): Promise<HomePathMap> => {
      const res = await commands.getHomeDir();
      if (res.status === "ok") {
        return res.data as HomePathMap;
      }
      throw new Error("failed to fetch home dir");
    }

    fetchHomes().then((h) => {
      setHomeDir(h)
    })
  }, [])

  return (
    <div className="tree-head">
      <div className="link root" title="/" onClick={() => clickHomeDir('/')}>
        <Icon icon={faInbox} />
      </div>
      <div className="link home" title="Home" onClick={() => clickHomeDir(homeDir.HomeDir)}>
        <Icon icon={faHouseUser} />
      </div>
      <div
        className="link down"
        title="Downloads"
        onClick={() => clickHomeDir(homeDir.DownloadDir)}
      >
        <Icon icon={faDownload} />
      </div>
      <div
        className="link docs"
        title="Documents"
        onClick={() => clickHomeDir(homeDir.DocumentDir)}
      >
        <Icon icon={faFileWord} />
      </div>
      <div className="link video" title="Movie" onClick={() => clickHomeDir(homeDir.VideoDir)}>
        <Icon icon={faVideo} />
      </div>
      <div className="link music" title="Music" onClick={() => clickHomeDir(homeDir.AudioDir)}>
        <Icon icon={faMusic} />
      </div>
      <div className="link image" title="Image" onClick={() => clickHomeDir(homeDir.PictureDir)}>
        <Icon icon={faImage} />
      </div>
      <div
        className="link desktop"
        title="Desktop"
        onClick={() => clickHomeDir(homeDir.DesktopDir)}
      >
        <Icon icon={faDesktop} />
      </div>
    </div>
  )
}

export default TreeHeadView;
