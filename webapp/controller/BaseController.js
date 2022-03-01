sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox"
],
    /**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller, UIComponent, mobileLibrary, Dialog, Text, Button, History, MessageBox, Utils, campoValida) {
        "use strict";
        var ButtonType = mobileLibrary.ButtonType;

        return Controller.extend("com.itsgrp.brz.jornada.controller.BaseController", {

            _onNavBack: function (sPath) {
                var sPreviousHash = History.getInstance().getPreviousHash(),
                    sHistory = sPath;
                // sHistory = Utils.returnNow(sPath);
                if (sPreviousHash === sHistory) {
                    window.history.go(-1);
                } else {
                    if (!sHistory) {
                        sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteList", true);
                    } else {
                        sap.ui.core.UIComponent.getRouterFor(this).navTo(sHistory, true);
                    }
                    
                }
            },

            getI18n: function (sText) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sText);
            },
            
            getRouter: function () {
                return UIComponent.getRouterFor(this);
            },

            getModel: function (sName) {
                return this.getView().getModel(sName);
            },

            setModel: function (oModel, sName) {
                return this.getView().setModel(oModel, sName);
            },

            setCoreModel: function (oJson, sPath) {
                sap.ui.getCore().setModel(oJson, sPath);
            },

            getCoreModel: function (sPath) {
                return sap.ui.getCore().getModel(sPath);
            },

            getServices: async function (sService, oParams) {
                let oMethodCall, aReturnGet, sParams;

                sParams = this._configParams(oParams);
                oMethodCall = this._callServicesGet(sService,`c4c?${sParams}`);
                aReturnGet = await oMethodCall.method('GET')
                sap.ui.core.BusyIndicator.hide();   
                return aReturnGet;
            },

            _callServicesGet: function (sServiceName, sCallMockC4c) {
                var oModel = this.getOwnerComponent().getModel();
                var sUrlService = oModel.sServiceUrl;
                
                let oHeader = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "entidade": sServiceName
                }

                if (sServiceName === "SalesPhaseRootCollection") {
                    oHeader.service = "cust/v1/z_fases_venda";
                } else if (sServiceName === "ZStatusObraRootCollection") {
                    oHeader.service = "cust/v1/z_salesorg_situobra";
                }

                return {
                    method: async (sMethod) => {

                        let oResponse = await fetch(
                            `${sUrlService}/${sCallMockC4c}`,
                            {
                                method: sMethod.toUpperCase(),
                                headers: oHeader
                            }
                        ).then((response) => response.text())
                            .catch((err) => err);

                        return JSON.parse(oResponse);
                    }
                }
            },

            getServicesID: function (key) {
                var oModel = this.getOwnerComponent().getModel();
                var sUrlService = '/http/poc/getuser/v2';
                
                let oHeader = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "SCPI" : key
                }
				var sRootPath = this.getOwnerComponent().getModel("rootPath").getProperty("/path");				

				if (sRootPath === '..') {
					sRootPath = sUrlService
				} else {
					sRootPath = `${sRootPath}${sUrlService}`;
				}
				

                return {
                    method: async (sMethod) => {

                        let oResponse = await fetch(
                            `${sRootPath}`,
                            {
                                method: sMethod.toUpperCase(),
                                headers: oHeader
                            }
                        ).then((response) => response.text())
                            .catch((err) => err);

                        return oResponse;
                    }
                }
            },


            _configParams: function (oParams) {
                let sTextReturn, aReturn = [];

                if (oParams.top) {
                    aReturn.push(oParams.top);
                }
                if (oParams.filter) {
                    aReturn.push(oParams.filter);
                }
                if (oParams.select) {
                    aReturn.push(oParams.select);
                }
                if (oParams.expand) {
                    aReturn.push(oParams.expand);
                }
                if (oParams.language) {
                    aReturn.push(oParams.language);
                }

                aReturn.push("$format=json");
                sTextReturn = aReturn.join("&");

                return sTextReturn;
            }
     
        });

    });