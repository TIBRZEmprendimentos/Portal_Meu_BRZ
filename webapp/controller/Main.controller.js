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

	function (BaseController, SuiteLibrary, TablePersoController, JSONModel, FilterOperator, Filter, MessageToast, Fragment) {
		"use strict";

		return BaseController.extend("com.itsgrp.brz.jornada.controller.Main", {
			onInit: function () {
				this._configLocalJSON();
				
				this.getRouter().getRoute("RouteList").attachPatternMatched(this._onRouteMatched, this);
			},

			/**
			 * Eventos
			 */

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
			},

			/**
			 * 
			 * Services
			 */

			
			_onRouteMatched: async function(oEvent) {
				let oParameters = oEvent.getParameter("arguments");

				let oOportunity = await this._getOpportunity(oParameters.id);

				this._getUserID(oOportunity);
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

			_getUserID: async function (oOportunity) {
				sap.ui.core.BusyIndicator.show();

				var userInfo = sap.ushell.Container.getService("UserInfo");
				var email = userInfo.getEmail();

				if (email === undefined || email === "")
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

				this._loadFlowUI(this._flowData.userID, oOportunity);	
				sap.ui.core.BusyIndicator.hide();
			},

			_loadFlowUI: async function (sUserId, oOportunity) {
				sUserId = "1019542";
				
				var oView = this.getView();			
				
                var sRootPath = this.getOwnerComponent().getModel("rootPath").getProperty("/path");
				var sUrlService = "/model/ProcessFlowLanesAndNodes.json";

				var aPhaseRoot = await this._getPhaseRoot();
				var oContract = await this._getContractUser(sUserId);
				var oStatusObra = await this._getStatusObra(oOportunity);
				var oPartner = await this._getPartnerCollection(oOportunity);
				
				sRootPath = `${sRootPath}${sUrlService}`;
				
				var oDataFlow = new sap.ui.model.json.JSONModel(sRootPath);
				
				var that = this;
				oDataFlow.attachRequestCompleted(async function() {
					let oLanes = oDataFlow.getProperty("/lanes");
                	let aNodes = oDataFlow.getProperty("/nodes");

					let oModelFlow = that.getView().getModel();
					let oData = oModelFlow.getData();

					aNodes = this._mapNodes(aNodes, aPhaseRoot, oContract, oStatusObra, oPartner);
				
					oData.lanes = oLanes;
					oData.nodes = aNodes;
				
					oModelFlow.setData(oData);
					
					oView.byId("processFlowJornada").updateModel();									
				}.bind(this));
			},

			_mapNodes: function(aNodes, aPhaseRoot, oContract, oStatusObra, oPartner) {
				let oPhase;

				return aNodes.map(oNode => {
					// Se ID = 20 | Simulação BRZ | 02C2AC64ACEC1EDC9FA8BF613BFAB0BB
					if (oNode.id === "20") {
						oPhase = aPhaseRoot.find(element => element.ObjectID === "02C2AC64ACEC1EDC9FA8BF613BFAB0BB");
						oNode.title = oPhase.ZFASEDEVENDAS;
						oNode.quickView.groups[0].heading = oPhase.ZFASEDEVENDAS;	
						oNode.quickView.groups[0].elements[0].value = oPhase.ZDESCRICAOVENDAS;
					} else if (oNode.id === "30") {
						oPhase = aPhaseRoot.find(element => element.ObjectID === "061528C2F6F41EECA08AD054B3131281");
						oNode.title = oPhase.ZFASEDEVENDAS;
						oNode.quickView.groups[0].heading = oPhase.ZFASEDEVENDAS;	
						oNode.quickView.groups[0].elements[0].value = oPhase.ZDESCRICAOVENDAS;
					} else if (oNode.id === "51") {
						let sValue = oNode.quickView.groups[0].elements[0].value,
							sDate;

						if (oContract.Datadeassinatura_KUT) {
							sDate = new Date(oContract.Datadeassinatura_KUT).toLocaleDateString("pt-br");
						} else {
							sDate = "[]"
						}
						sValue = sValue.replace("ALTERARDATA1", sDate);

						oNode.quickView.groups[0].elements[0].value = sValue;
					} else if (oNode.id === "61") {
						let sValue = oNode.quickView.groups[0].elements[0].value,
							sPercent, sDate, sEntrega;

						// Percentual
						if (oStatusObra.ZGERAL) {
							sPercent = parseFloat(oStatusObra.ZGERAL).toLocaleString("pt-br", {
								minimumFractionDigits: 2
							})
						} else {
							sPercent = "0,00"
						}
						sValue = sValue.replace("ALTERARVALOR1", sPercent);
						// Dt de Entrega
						if (oPartner.Datadaentrega_KUT) {
							sDate = new Date(oPartner.Datadaentrega_KUT).toLocaleDateString("pt-br");
						} else {
							sDate = "[]"
						}
						sValue = sValue.replace("ALTERARVALOR2", sDate);
						// Sts Entrega
						if (oPartner.EstagiodaObra_KUTText !== "") {
							sEntrega = oPartner.EstagiodaObra_KUTText;
						} else {
							sEntrega = "";
						}
						sValue = sValue.replace("ALTERARVALOR3", sEntrega);

						oNode.quickView.groups[0].elements[0].value = sValue;
					}
					
					return oNode;

				});
			},
			
			_getPhaseRoot: async function() {
				let aDados = await this.getServices("SalesPhaseRootCollection", {
					language: "sap-language=PT"
				});

				let aDataServiceRequest = aDados.SalesPhaseRootCollection.SalesPhaseRoot;
				let oJSONModel = new JSONModel(aDataServiceRequest); 

				if (oJSONModel.oData.length > 1) {
					return aDataServiceRequest;
				} else {
					return [aDataServiceRequest];
				}
			},

			_getOpportunity: async function(sId) {
				let aDados = await this.getServices("OpportunityCollection", {
					language: "sap-language=PT",
					filter: "$filter=ID eq '" + sId + "'",
					select: "$select=ID,SalesUnitPartyID"
				});

				if (aDados.OpportunityCollection !== "") {
					return aDados.OpportunityCollection.Opportunity;
				}

				return {}
			},

			_getContractUser: async function(sUserId) {
				let aDados = await this.getServices("ContractCollection", {
					select: "$select=ID,Datadeassinatura_KUT",
					top: "$top=1",
					filter: `$filter=BuyerPartyID eq '${sUserId}'`
				})
				
				if (aDados.ContractCollection !== "") {
					return aDados.ContractCollection.Contract;
				}

				return {}
			},

			_getStatusObra: async function(oOportunity) {
				let aDados = await this.getServices("ZStatusObraRootCollection", {
					select: "$select=ZID,ZGERAL",
					filter: `$filter=ZID eq '${oOportunity.SalesUnitPartyID}'`
				});

				if (aDados.ZStatusObraRootCollection !== "") {
					return aDados.ZStatusObraRootCollection.ZStatusObraRoot;
				}

				return {}
			},

			_getPartnerCollection: async function(oOportunity) {
				let aDados = await this.getServices("PartnerCollection", {
					select: "$select=Datadaentrega_KUT,EstagiodaObra_KUTText",
					filter: `$filter=IDEmpreendimento_KUT eq '${oOportunity.SalesUnitPartyID}'`
				});

				if (aDados.PartnerCollection !== "") {
					return aDados.PartnerCollection.Partner;
				}

				return {}
			}

		});
	});
