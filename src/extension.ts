// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as Commands from './Commands';
// import * as fs from 'fs';

function escapeShellArg (arg: string) {
    return `'${arg.replace(/'/g, `'\\''`)}'`;
}

function runFile(cmd:string, data: string[]|string) : Promise<string> {
	console.log(`Running command ${cmd} with params: ${data}`);
	let args = [cmd];
	if (data instanceof Array){
		data.forEach(o => args.push(o));
	} else {
		args.push(data);
	}
	args = args.map(escapeShellArg);
	const line = vscode.workspace.rootPath + "/.vscode.lng " + args.join(" ");
	return new Promise((resolve, reject) => {
		// the resolve / reject functions control the fate of the promise
		cp.exec(line, (error, stdout, stderr) => {
			resolve(stdout + stderr);
		});
	});
	
}

function formatData(...data :string[]){
	//data = data.map(o => '"' + o + '"');
	return data.join(" ");
}
let typeMap = {
	'fi': vscode.CompletionItemKind.Field,
	'v': vscode.CompletionItemKind.Variable,
	'f': vscode.CompletionItemKind.Function,
	'p': vscode.CompletionItemKind.Property
};
function createCompletionItem(o: string){
	let chunks:string[] = o.split(" ");
	let type = vscode.CompletionItemKind.Field;
	if (chunks.length > 1 &&  (<any>typeMap)[chunks[0]] !== undefined){
		type = <vscode.CompletionItemKind>((<any>typeMap)[chunks[0]]);
		o = chunks.slice(1).join(" ");
	}
	return new vscode.CompletionItem(o, type);
}

export function activate(context: vscode.ExtensionContext) {
	// if (!fs.existsSync(vscode.workspace.rootPath + "/.vscode.lng")){
	// 	vscode.window.showInformationMessage("fs-intellisense: .vscode.lng file not found, switching off...");
	// 	return;
	// }
	return runFile(Commands.INIT, vscode.workspace.rootPath || "")
	.then(res => {
		console.log("Init complete: ", res, res.length);
		if (!res){
			vscode.window.showErrorMessage("Error initializing fs-intellisense extension, please check .vscode.lng file");
			return;
		}
		let resChunks = res.trim().split(" ");
		let language = resChunks[1].trim();
		let divider = resChunks[0].trim();
		console.log(`lang: ${language} divider: ${divider}`);
		
		const provider = vscode.languages.registerCompletionItemProvider(
			language,
			{
				provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
					
					// get all text until the `position` and check if it reads `console.`
					// and iff so then complete if `log`, `warn`, and `error`
					let linePrefix = document.lineAt(position).text.substr(0, position.character);
					if (vscode.window.activeTextEditor !== undefined){
						return runFile(Commands.INTELLISENCE, formatData(linePrefix, vscode.window.activeTextEditor.document.fileName))
							.then( res => {
								let resChunks = res.split("\n").filter(o => o.length);
								console.log("completion: ", resChunks);
								return resChunks.map(createCompletionItem);
							});
					}
					return undefined;
				}
			},
			divider // triggered whenever a '.' is being typed
		);
		const definitionProvider = vscode.languages.registerDefinitionProvider(language, {
			provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken){
				if (vscode.window.activeTextEditor){
					let linePrefix = document.lineAt(position).text.substr(0, position.character);

					return runFile(Commands.DEFINITION, formatData(linePrefix, vscode.window.activeTextEditor.document.fileName))
					.then( res => {
						let resChunks = res.split("\n").filter(o => o.length);
						return resChunks.map(line => {
							let chunks = line.split(" ");

							const definitionResource = vscode.Uri.file(chunks[0]);
							const pos = new vscode.Position(parseInt(chunks[1]), parseInt(chunks[2]));
							const location = new vscode.Location(definitionResource, pos);
							console.log("Location is:", location);
							return  location;
						});
					});
				}
			}
		});
		context.subscriptions.push(provider);
		context.subscriptions.push(definitionProvider);
	})
	.catch(err => {
		vscode.window.showErrorMessage("Error initializing fs-intellisense extension: " + err);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
