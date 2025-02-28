/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module IModelApp
 */

import { BrowserAuthorizationClient, BrowserAuthorizationClientConfiguration } from "@bentley/frontend-authorization-client";
import { BentleyCloudRpcManager, BentleyCloudRpcParams, RpcRoutingToken } from "@bentley/imodeljs-common";
import { IModelApp, IModelAppOptions } from "./IModelApp";

/**
 * Options for [[WebViewerApp.startup]]
 * @beta
 */
export interface WebViewerAppOpts {
  iModelApp?: IModelAppOptions;
  webViewerApp: {
    rpcParams: BentleyCloudRpcParams;
    routing?: RpcRoutingToken;
    /** if present, IModelApp.authorizationClient will be set to an instance of BrowserAuthorizationClient */
    authConfig?: BrowserAuthorizationClientConfiguration;
  };
}

/**
 * The frontend of apps with a shared backend for visualization of iModels. WebViewerApps may only open
 * iModels readonly, and may not use Ipc.
 * @beta
 */
export class WebViewerApp {

  private static _isValid = false;
  private static get isValid() { return this._isValid; }

  public static async startup(opts: WebViewerAppOpts) {
    if (!this.isValid) {
      this._isValid = true;
      const params = opts.webViewerApp;
      BentleyCloudRpcManager.initializeClient(params.rpcParams, opts.iModelApp?.rpcInterfaces ?? [], params.routing);
    }
    await IModelApp.startup(opts.iModelApp);
    if (opts.webViewerApp.authConfig)
      IModelApp.authorizationClient = new BrowserAuthorizationClient(opts.webViewerApp.authConfig);
  }

  public static async shutdown() {
    // don't set isValid = false, we can only call BentleyCloudRpcManager.initializeClient once
    await IModelApp.shutdown();
  }
}

