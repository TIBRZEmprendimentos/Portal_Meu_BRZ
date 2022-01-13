sap.ui.define([
	"./BaseController",
	'sap/suite/ui/commons/library',
	'sap/m/TablePersoController',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	'sap/ui/core/Fragment'
],

	function (BaseController, SuiteLibrary, Constants, TablePersoController, JSONModel, FilterOperator, Filter, MessageToast, Fragment) {
		"use strict";

		return BaseController.extend("com.itsgrp.brz.jornada.controller.Main", {
			onInit: function () {
				this._configLocalJSON();
				this._getUserID();							
			},			

			_configLocalJSON: function () {
				this._flowData = {					
					userID: "",
					nodes: {},
					lanes: {}
				};
				
			
				this.oModelFlow = new sap.ui.model.json.JSONModel();
				this.oModelFlow.setData(this._flowData);
				this.getView().setModel(this.oModelFlow);

			},

			_getUserID: async function () {
				sap.ui.core.BusyIndicator.show();

				var userInfo = sap.ushell.Container.getService("UserInfo");
				var email = userInfo.getEmail();

				if(email = "undefined" || email === "")
				{
					email = "orioncastelli@gmail.com";
				}

				let oMethodCall = this.getServicesID(btoa(email));
				let sXMLID = await oMethodCall.method('GET');
				let res = jQuery.parseXML(sXMLID);
				let id = res.getElementsByTagName("id")[0];
					
				let oModel = this.getView().getModel();
				let oData = oModel.getData();

				this._flowData.userID = id.innerHTML;
				console.log("UserID: " + this._flowData.userID); 
				oData.key = btoa(email);
				oModel.setData(oData);

				this._loadFlowUI();	
				sap.ui.core.BusyIndicator.hide();
			},

			_loadFlowUI: function (view) {
				var oView = this.getView();			
				
                var sRootPath = this.getOwnerComponent().getModel("rootPath").getProperty("/path");
				var sUrlService = "/model/ProcessFlowLanesAndNodes.json";

							
				
				console.log(sRootPath);
				sRootPath = `${sRootPath}${sUrlService}`;
				console.log(sRootPath);
				
				var oDataFlow = new sap.ui.model.json.JSONModel(sRootPath);
				
				var that = this;
				oDataFlow.attachRequestCompleted(function() {
					let oLanes = oDataFlow.getProperty("/lanes");
                	let oNodes = oDataFlow.getProperty("/nodes");

					let oModelFlow = that.getView().getModel();
					let oData = oModelFlow.getData();
				
					oData.lanes = oLanes;
					oData.nodes = oNodes;
				
					oModelFlow.setData(oData);
					
					console.log(oModelFlow);

					oView.byId("processFlowJornada").updateModel();									
				});
			},

			onOnError: function(event) {
				MessageToast.show("Exception occurred: " + event.getParameters().text);
			},
	
			onHeaderPress: function(event) {
			//	var sDataPath = sap.ui.require.toUrl("sap/suite/ui/commons/sample/ProcessFlow/ProcessFlowNodes.json");
			//	this.getView().getModel("pf2").loadData(sDataPath);
			},
	
			onNodePress: function(oEvent) {
				var oNode = oEvent.getParameters();
				var sPath = oNode.getBindingContext().getPath() + "/quickView";
	
				if (!this.oQuickView) {
					sap.ui.core.Fragment.load({
						name: "com.itsgrp.brz.jornada.view.QuickView",
						type: "XML"
					}).then(function(oFragment) {
						this.oQuickView = oFragment;
						this.getView().addDependent(this.oQuickView);
	
						this.oQuickView.bindElement(sPath);
						this.oQuickView.openBy(oNode);
					}.bind(this));
				} else {
					this.oQuickView.bindElement(sPath);
					this.oQuickView.openBy(oNode);
				}
			},
	
			onZoomIn: function () {
				this.oProcessFlow1.zoomIn();
	
				MessageToast.show("Zoom level changed to: " + this.oProcessFlow1.getZoomLevel());
			},
	
			onZoomOut: function () {
				this.oProcessFlow1.zoomOut();
	
				MessageToast.show("Zoom level changed to: " + this.oProcessFlow1.getZoomLevel());
			},
	
			onHighlightPath: function() {
				// var sDataPath = sap.ui.require.toUrl("sap/suite/ui/commons/sample/ProcessFlow/ProcessFlowNodesHighlightedNodes.json");
				// this.getView().getModel().loadData(sDataPath);
	
				MessageToast.show("Path has been highlighted");
			},
	
			onUpdateModel: function() {
				// var sDataPath = sap.ui.require.toUrl("sap/suite/ui/commons/sample/ProcessFlow/ProcessFlowUpdateModel.json");
	
				// this.getView().getModel().loadData(sDataPath);
				// MessageToast.show("Model has been updated");
			},

			onPress: function(oEvent, sVal)
			{
				console.log(sVal);
				console.log(oEvent);
			}

		});
	});
