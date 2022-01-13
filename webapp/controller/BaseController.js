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
            }
     
        });

    });