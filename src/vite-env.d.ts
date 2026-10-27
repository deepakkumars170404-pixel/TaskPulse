/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface DocumentPictureInPictureOptions {
  width?: number;
  height?: number;
  disallowReturnToOpener?: boolean;
}

interface DocumentPictureInPictureEvent extends Event {
  window: Window;
}

interface DocumentPictureInPicture {
  requestWindow(options?: DocumentPictureInPictureOptions): Promise<Window>;
  window: Window | null;
  onenter: ((this: DocumentPictureInPicture, ev: DocumentPictureInPictureEvent) => any) | null;
  addEventListener(type: string, listener: (ev: any) => any): void;
  removeEventListener(type: string, listener: (ev: any) => any): void;
}

interface ElectronAPI {
  isElectron: boolean;
  resizeFloating: (mode: 'logo' | 'expanded') => void;
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
