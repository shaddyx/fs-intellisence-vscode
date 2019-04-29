import * as path from 'path';
import * as vscode from 'vscode';
import { ArrayTools } from './ArrayTools';
export class FileTools{
    files:vscode.Uri[] = [];
    
    startup(cb: {(a: any): any}){
        let workspaceRoot = vscode.workspace.rootPath;
        if (!workspaceRoot){
            return;
        }
        let simplePattern = "mod/**/*";
        let pattern = path.join(workspaceRoot, simplePattern);
        let fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
        fileWatcher.onDidChange(o => cb(this.files));
        console.log("Searching files in pattern: " + pattern);
        vscode.workspace.findFiles(simplePattern, '**/node_modules/**', 10000).then(o=>{
            this.files = o;
            console.log(o);
            cb(this.files);
        });
    }

    static removeFileExt(str: string): string{
        let pathChunks = str.split("/");
        let last = ArrayTools.getLast(pathChunks);
        let noExt = ArrayTools.rmLast(last.split("."), 1).join(".");
        pathChunks[pathChunks.length - 1] = noExt
        return pathChunks.join("/");
    }
}