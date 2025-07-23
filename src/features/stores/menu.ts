import { create } from 'zustand'

interface MenuState {
  showWebcam: boolean
  showCapture: boolean
  fileInput: HTMLInputElement | null
  bgFileInput: HTMLInputElement | null
}

const menuStore = create<MenuState>((set, get) => ({
  showWebcam: false,
  showCapture: false,
  fileInput: null,
  bgFileInput: null,
}))
export default menuStore
