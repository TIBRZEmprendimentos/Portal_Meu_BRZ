sap.ui.define([
	"./BaseController",
	'sap/m/TablePersoController', 
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter"
],
	function (BaseController, TablePersoController, JSONModel, FilterOperator, Filter) {
		"use strict";

		return BaseController.extend("com.itsgrp.brz.jornada.controller.ListReport", {
			_configLocalJSON: function () {
				this._JSONLocal = new JSONModel({
					user: {
						PortalId: "",
						Name: "",
						Email: "",
						C4CId: "",
						C4CTipo: ""
					},
					count: 0
				});
				this.setModel(this._JSONLocal	,"local");
			},


			onInit: function () {
			
				this._personalizationTable();
				this._configLocalJSON();
				this._loadData();
				this._getServiceTableData();

			},
			
			_loadData: function(){
				let oDados = this._JSONLocal.getProperty("/user");
				let userInfo = sap.ushell.Container.getService("UserInfo");

				oDados.PortalId = "";
				oDados.Name = "";
				oDados.Email = "";
				oDados.C4CId = "";

				oDados.PortalId = userInfo.getId();
				oDados.Name = userInfo.getFirstName();
				oDados.Email = userInfo.getEmail();

				console.log("Portal: " + JSON.stringify(oDados));
				if (oDados.PortalId == "DEFAULT_USER") {
					oDados.Email = "leadpf01@getnada.com";
				}

				this._JSONLocal.setProperty("/user", oDados);
				this.setModel(this._JSONLocal, "local");
			},

			_getServiceTableData: async function () {
				let oDados = this._JSONLocal.getProperty("/user");
				let email = oDados.Email;

				var userInfo = sap.ushell.Container.getService("UserInfo");
							
				
				email = userInfo.getEmail();
				if(email === undefined || email === "")
				{
					email = "orioncastelli@gmail.com";
				}

				sap.ui.core.BusyIndicator.show();
				let oMethodCall = this.getServicesID(btoa(email));
				let sXMLID = await oMethodCall.method('GET');
				let res = jQuery.parseXML(sXMLID);
				let id = res.getElementsByTagName("id")[0];
					
				oDados.C4CId = id.innerHTML;
				// oDados.C4CId = '1008689';
				// oDados.C4CId = '1010117';


				let aDados = await this.getServices("OpportunityCollection", {
					language: "sap-language=PT",
					filter: "$filter=ProspectPartyID eq '" + oDados.C4CId + "'",
					select: "$select=ID,Name,SalesCycleCodeText,SalesCycleCode,MainEmployeeResponsiblePartyName,SalesUnityPartyName"
				});
 
				let aDataServiceRequest = aDados.OpportunityCollection.Opportunity;
				let oJSONModel = new JSONModel(aDataServiceRequest); 

				if (oJSONModel.oData.length > 1) {
						this.setModel(oJSONModel, 'odata');
				} else {
					let aOdata = [];
					aOdata.push(oJSONModel.oData);
					console.log(aOdata);
					oJSONModel.oData = aOdata;
					this.setModel(oJSONModel, 'odata');
				}
							
			},

			onAdd: function () {
				this.getRouter().navTo("TargetAddOcorrencia");
			},

			////////////////// CONFIGURAÇÃO Filtros ///////////////
			onReset: function(oEvent) {
				var aFiltersInput = oEvent.getParameter("selectionSet");
				aFiltersInput.map( (oInput) => {
					if (oInput.getValue()) {
						oInput.setValue("");
					}
				});
			},
 			onSearch: function(oEvent) {
				var aFilters = [];
				var aFiltersInput = oEvent.getParameter("selectionSet");
				aFiltersInput.map( (oInput) => {
					if (oInput.getValue()) {
						let oFilter = new Filter(oInput.getName(), FilterOperator.Contains, oInput.getValue());
						aFilters.push(oFilter);
					}
				});
				this._bindingFilterList(aFilters);
			},
			_bindingFilterList(aFilters) {
				let oList = this.byId("ServiceRequest");
				oList.getBinding("items").filter(aFilters);
			},
			onChangeFilter: function() {
				let oFilterBar = this.byId("filterbar");
				let aFilterGroupItems = oFilterBar.getFilterGroupItems();
				let aFilters = [];
				
				let aInputFilter = aFilterGroupItems.map( (oFilterGroup) => {return oFilterGroup.getControl()});

				aInputFilter.map( (oInput) => {
					if (oInput.getValue()) {
						let oFilter = new Filter(oInput.getName(), FilterOperator.Contains, oInput.getValue());
						aFilters.push(oFilter);
					}
				});
				this._bindingFilterList(aFilters);
			},
			////////////////// CONFIGURAÇÃO TABLE ///////////////
			_personalizationTable: function () {
                this._oTPC = null;
                var oPersonalizationService = sap.ushell.Container.getService("Personalization");
                var oPersonalizer = oPersonalizationService.getPersonalizer({
                    container: "itsbrz.portalbr", // This key must be globally unique (use a key to
                    // identify the app) Note that only 40 characters are allowed
                    item: "itemDataTable" // Maximum of 40 characters applies to this key as well
                });
                this._oTPC = new TablePersoController({
                    table: this.byId("ServiceRequest"),
                    //specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
                    componentName: "table",
                    persoService: oPersonalizer
                }).activate();
            },
			onPersoButtonPressed: function (oEvent) {
                this._oTPC.openDialog();
                this._oTPC.attachPersonalizationsDone(this, this._onPerscoDonePressed.bind(this));
            },
			_onPerscoDonePressed: function (oEvent) {
                this._oTPC.savePersonalizations();
            },

			onNavigate: function(oEvent) {
				let oList = oEvent.getSource(),
					oItem = oList.getBindingContext("odata").getObject();

				this.getRouter().navTo("RouteList", {
					id: oItem.ID
				});
			},

			onExit: function () {
				this._oTPC.destroy();
			}

			
		});
	});
