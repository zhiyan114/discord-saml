/* Webhook service using express-based server (for replit compatibility) */

import { default as Express } from 'express';
import websocket from 'ws';
import https from 'https';
import http from 'http';
import {webServer} from '../../config.json';
import { sendLog, LogType } from '../utils/eventLogger';
import cookieParser from 'cookie-parser';

export const isHttpsMode = webServer.https.certificate && webServer.https.key;
export const baseURL = `${isHttpsMode ? "https" : "http"}://${webServer.FQDN}/`

export const restServer = Express();
restServer.use(cookieParser());

let internalServer : https.Server | http.Server;
if(isHttpsMode) {
    internalServer = https.createServer(restServer);
} else {
    internalServer = http.createServer(restServer);
}
// Configure Websocket Server
export const socketServer = new websocket.Server({ server: internalServer, path: "/api/v1/websocket" });

// No internal websocket implementation, just log and kick off illegal client
socketServer.on('connection', (socket, req) => {
    console.log("Illegal webSocket connection established...");
    sendLog(LogType.Warning, "Illegal webSocket connection established",{
        IP: req.socket.remoteAddress || "Unavailable",
    });
    socket.close(1011);
});

// Start Server

let strMode = isHttpsMode ? "HTTPS" : "HTTP";
internalServer.listen(webServer.port || (isHttpsMode ? 443 : 80), "0.0.0.0",()=> {
    console.log(`Internal Webserver launched (${strMode} Mode)...`);
    sendLog(LogType.Info, "Webserver has been successfully launched", {"Mode": strMode});
});

import './ServiceProvider';