import { useEffect } from "react";
import { useUpdateStore } from "../store/useUpdateStore";

export const useUpdateHandlers = () => {
  const { setStatus, setMessage, setProgress, setVersion, setError } = useUpdateStore();

  useEffect(() => {
    if (typeof window === "undefined" || !window.api) return;

    const cleanupChecking = window.api.onUpdateChecking?.(() => {
      setStatus("checking");
    }) || (() => {});

    const cleanupMessage = window.api.onUpdateMessage((message) => {
      setMessage(message);
    });

    const cleanupAvailable = window.api.onUpdateAvailable((info) => {
      setStatus("available");
      setVersion(info.version);
    });

    const cleanupNotAvailable = window.api.onUpdateNotAvailable(() => {
      setStatus("not-available");
    });

    const cleanupProgress = window.api.onUpdateDownloadProgress((progress) => {
      setStatus("downloading");
      setProgress(progress.percent);
    });

    const cleanupDownloaded = window.api.onUpdateDownloaded(() => {
      setStatus("downloaded");
    });

    const cleanupError = window.api.onUpdateError((err) => {
      setStatus("error");
      setError(err);
    });

    return () => {
      cleanupChecking();
      cleanupMessage();
      cleanupAvailable();
      cleanupNotAvailable();
      cleanupProgress();
      cleanupDownloaded();
      cleanupError();
    };
  }, [setStatus, setMessage, setProgress, setVersion, setError]);
};
