import { Config } from '@remotion/cli/config'

// The 3D shower disc (three.js) needs real WebGL in the headless browser.
Config.setChromiumOpenGlRenderer('angle')
Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(95)
// Use the Microsoft Edge (Chromium) already installed on this PC instead of downloading a browser.
Config.setBrowserExecutable('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
