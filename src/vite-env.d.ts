/// <reference types="vite/client" />

interface DocumentPictureInPictureEvent extends Event {
  readonly window: Window;
}

interface DocumentPictureInPictureOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
}

interface DocumentPictureInPicture {
  requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
  readonly window: Window | null;
  onenter: ((this: DocumentPictureInPicture, ev: DocumentPictureInPictureEvent) => any) | null;
  addEventListener(type: string, listener: (ev: any) => any): void;
  removeEventListener(type: string, listener: (ev: any) => any): void;
}

interface ElectronAPI {
  isElectron: boolean;
  resizeFloating: (mode: 'logo' | 'expanded') => void;
  showFloating?: () => void;
  toggleFloating?: () => void;
  startDrag?: () => void;
  stopDrag?: () => void;
  moveFloatingBy?: (dx: number, dy: number) => void;
  moveFloatingTo?: (x: number, y: number) => void;
  openMainWindow: () => void;
  closeFloating: () => void;
  quitApp: () => void;
  setIgnoreMouseEvents?: (ignore: boolean, forward?: boolean) => void;
  onToggleFloating?: (callback: () => void) => () => void;
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture;
  electronAPI?: ElectronAPI;
}
