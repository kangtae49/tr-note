import React, {createContext, useContext, useEffect, useState} from "react";
import {commands, ServInfo} from "@/bindings.ts";

const HttpContext = createContext<HttpContextType | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

type HttpContextType = {
  servInfo: ServInfo
  getSrc: (path: string) => string
  getSrcJson: (path: string) => Promise<any>
  getSrcText: (path: string) => Promise<string>
  getSrcBlob: (path: string) => Promise<Blob>
  getSrcBlobUrl: (path: string) => Promise<string>
  healthCheck: () => Promise<Response>
}

export function HttpServerProvider({children}: Props) {
  const [httpServer, setHttpServer] = useState<HttpContextType|undefined>(undefined);
  const [servInfo, setServInfo] = useState<ServInfo|undefined>(undefined);

  const getSrc = (path: string) => {
    return `http://localhost:${servInfo?.port}/get_file?path=${path}`
  };
  const getSrcJson = async (path: string) => {
    const url = `http://localhost:${servInfo?.port}/get_file?path=${path}`;
    return fetch(url)
      .then(res => res.json());
  };
  const getSrcText = async (path: string) => {
    const url = `http://localhost:${servInfo?.port}/get_file?path=${path}`;
    return fetch(url)
      .then(res => res.text())
  };
  const getSrcBlob = async (path: string) => {
    const url = `http://localhost:${servInfo?.port}/get_file?path=${path}`;
    return fetch(url)
      .then(res => res.blob());
  }
  const getSrcBlobUrl = async (path: string) => {
    const url = `http://localhost:${servInfo?.port}/get_file?path=${path}`;
    return fetch(url)
      .then(res => res.blob())
      .then(blob => URL.createObjectURL(blob))
  }

  const healthCheck = async () => {
    const url = `http://localhost:${servInfo?.port}/health`;
    return fetch(url);
  }

  useEffect(() => {
    commands.runHttpServer({
      id: "tr-note-http",
      ip: '127.0.0.1',
      port: 0,
      path: '',
    }).then(res => {
      if (res.status === 'ok') {
        setServInfo(res.data);
      }
    });
    return () => {
      setServInfo(undefined);
      commands.shutdownHttpServer("tr-note-http")
        .then(() => {
        })
        .catch(() => {});
    }
  }, [])

  useEffect(() => {
    if(servInfo == undefined) return;
    setHttpServer({
      servInfo,
      getSrc,
      getSrcJson,
      getSrcText,
      getSrcBlob,
      getSrcBlobUrl,
      healthCheck
    });
  }, [servInfo]);
  return (
    <HttpContext.Provider value={httpServer}>
      {children}
    </HttpContext.Provider>
  );
}

export function useHttp() {
  return useContext(HttpContext);
}



