import * as vscode from "vscode";
import ContentProvider from "./ContentProvider";
import { join } from "path";
import Indexer from "./indexer/Indexer";
import Project from "./indexer/Project";

export function activate(context: vscode.ExtensionContext) {
  const contentProvider = new ContentProvider();
  let currentPanel: vscode.WebviewPanel | undefined = undefined;
  const indexer = new Indexer();

  let disposable = vscode.commands.registerCommand("insight.showPanel", () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.Two);
    } else {
      currentPanel = vscode.window.createWebviewPanel(
        "insight",
        "Insight",
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );
    }

    currentPanel.webview.html = contentProvider.getContent(context);

    const root = join(context.extensionPath, "icons");
    currentPanel.iconPath = {
      dark: vscode.Uri.file(join(root, "icon-light.png")),
      light: vscode.Uri.file(join(root, "icon-dark.png"))
    };

    currentPanel.webview.onDidReceiveMessage(
      message => {
        // message received
      },
      undefined,
      context.subscriptions
    );

    if (vscode.workspace.rootPath) {
      const project: Project = {
        root: vscode.workspace.rootPath
      };
      indexer.parse(project);
    }

    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
      },
      null,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}