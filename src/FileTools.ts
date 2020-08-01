import * as path from 'path';
import * as vscode from 'vscode';
import { ArrayTools } from './ArrayTools';
import * as cp from "child_process";

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
        pathChunks[pathChunks.length - 1] = noExt;
        return pathChunks.join("/");
    }

    static escapeShell(argument: string): string{
        argument = argument.split("\\").join("\\\\");
        argument = argument.split('"').join("\\\"");
        argument = '"' + argument + '"';
        return argument;
    }

    static async run(script: string, args: string[]): Promise<string> {
        const line = script + " " + args.map(this.escapeShell).join(" ");
        console.log("Executing with args: " + line);
        return new Promise((resolve, reject) => {
            cp.exec(line, (error, stdout, stderr) => {
                resolve(stdout + stderr);
            });
        });
    }
}