sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/BusyIndicator',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "sap/ui/core/Fragment"

],
    function (Controller, BusyIndicator, exportLibrary, Spreadsheet,Fragment) {
        "use strict";
        var EdmType = exportLibrary.EdmType;
        return Controller.extend("sap.aj.biochart.controller.View1", {
            onInit: function () { 
                new sap.m.BusyIndicator({
                    customIcon:"sap-icon://edit"
                })  
            },
            onAfterRendering: function () {
                var MainSubData = [{
                    "firstData": ""
                }];
                var data = this.getView().getModel("MainData").getData();
                data.forEach(function (ele) {
                    MainSubData.push(ele);
                })
                this.getView().getModel("MainSubData").setData(MainSubData);
            },
            createColumnConfig: function () {
                var aCols = [];
                aCols.push({
                    label :"Particulars",
                    property: 'secondData',
                    type: EdmType.String
                });
                aCols.push({
                    label :"Actual",
                    property: 'name1',
                    type: EdmType.Number
                });
                aCols.push({
                    label :"Budget",
                    property: 'name2',
                    type: EdmType.Number
                });
                aCols.push({
                    label :"Last Year",
                    property: 'name3',
                    type: EdmType.Number

                });
                return aCols;
            },
            ExcelExportDataPress: function (oEvent) {
                var that = this;
                var data = parseInt(oEvent.getSource().getParent().oPropagatedProperties.oBindingContexts.secondData.sPath.split("/").pop());
                var aCols, oRowBinding, oSettings, oSheet;
                oRowBinding = that.getView().getModel("secondData").getData()[data].newTable;
                aCols = this.createColumnConfig();
                oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'Table export sample.xlsx',
                    worker: false 
                };
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },
            onSearch: function (oEvent) {
                var that = this;
                var count = 0;
                var mainCount = 0;
                var arr = [];
                var Secondvalue = this.getView().byId("firstSelectedKey_Id").getSelectedKey();
                var Subvalue = this.getView().byId("selectSubId").getSelectedKey();
                if (that.getView().byId("MainSection_Id").getSelectedKey() !== '') {
                    that.getView().getModel("secondData").setData([]);
                    that.getView().getModel("MainData").getData().forEach(function (ele, i) {
                        if (ele.firstData == Secondvalue) {
                            ele.Table.forEach(function (element, j) {
                                if (element.secondData == Subvalue) {
                                    ele.newTable = [];
                                    ele.newTable.push(element);
                                    that.getView().getModel("secondData").setData([ele]);
                                }
                                if (Subvalue === undefined || Subvalue == "") {
                                    count++;
                                    ele.newTable = [];
                                    ele.Table.forEach(function (newData) {
                                        ele.newTable.push(newData);
                                    });
                                    that.AllDataGet = [ele];
                                }
                            })
                        }
                        if (Secondvalue === undefined || Secondvalue == "") {
                            mainCount++;
                            ele.newTable = [];
                            ele.Table.forEach(function (newData) {
                                ele.newTable.push(newData);
                            });
                            arr.push(ele);
                        }
                    })
                    if (mainCount > 0) {
                        that.getView().getModel("secondData").setData(arr);
                    }
                    if (count > 0) {
                        that.getView().getModel("secondData").setData(that.AllDataGet);
                    }
                } else {
                    that.getView().byId("MainSection_Id").setValueState("Error");
                }
                that.getView().getModel("secondData").refresh(true);
            },
            FilterBioHandlePress: function (oEvent) {
                var that = this;
                var getOdataPath = oEvent.getSource().getSelectedKey();
                // Model.read(getOdataPath,{
                //     success:function(res){
                //         that.getView().getModel("MainData").setData(res.results);
                //     },
                //     error:function(err){
                //         console.log(err);
                //     }
                // })
                oEvent.getSource().setValueState("None");
            },
            FilterSecondBioHandlePress: function (oEvent) {
                this.getView().getModel("secondDataBio").setData()
                if (oEvent.getSource().getSelectedIndex() == 0) return;
                var index = oEvent.getSource().getSelectedIndex() - 1;
                var SubArr = [{ "secondData": "" }];
                var newModelForSub = this.getView().getModel("MainData").getData();
                newModelForSub[index].Table.forEach(function (ele) {
                    SubArr.push(ele);
                })
                this.getView().getModel("secondDataBio").setData(SubArr);
                this.getView().getModel("secondDataBio").refresh(true);
            },
            ViewChartSingleDataPress: function (oEvent) {
                var that = this;
                var data = oEvent.getSource().getBindingContext("secondData").getObject();
                this.getView().getModel("ChartModelData").setData([data]);
                this.getView().getModel("ChartModelData").refresh(true)
                 BusyIndicator.show()
                if (!this._dialogL) {
                    this._dialogL = sap.ui.xmlfragment("sap.aj.biochart.Dialogs.ViewChart",this );
                    that.getView().addDependent(this._dialogL);
                }
                this._dialogL.getModel("ChartModelData").setData([data]);
                var vizframe = sap.ui.getCore().byId("firstTableSingleId");
                vizframe.setVizProperties({
                    title:{
                        text:"Details"
                    },
                    plotArea: {
                        colorPalette: ["#65B741","#FAA300","#5356FF"],
                        drawingEffect: "glossy"
                    },
                })
                BusyIndicator.hide();
                this._dialogL.open();
            },
            CloseDialogPress: function (oEvent) {
                if (oEvent.getSource().getProperty("text") === 'Close') {
                    oEvent.getSource().getParent().close();
                } else {
                    oEvent.getSource().getParent().getParent().close();
                }
            },
            ViewChartAllDataPress: async function (oEvent) {
                var that = this;
                var arr = [];
                var DivArr = ["name1", "name2", "name3"];
                var DivArrCat = ["Actual", "Budget", "Last Year"];
                var dataTableIndex = parseInt(oEvent.getSource().getParent().oPropagatedProperties.oBindingContexts.secondData.sPath.split("/").pop());
                var TableModelGet = this.getView().getModel("secondData").getData()[dataTableIndex].newTable
                for (var i = 0; i < TableModelGet.length; i++) {
                    for (var j = 0; j < DivArr.length; j++) {
                        arr.push(
                            {
                                "secondData": TableModelGet[i]["secondData"],
                                "Category": DivArrCat[j],
                                "Value": TableModelGet[i][DivArr[j]]
                            }
                        )
                    }
                }
               
                if (!this._dialog) {
                    BusyIndicator.show();
                    this._dialog = await sap.ui.xmlfragment("sap.aj.biochart.Dialogs.AllDataShow",this );
                    that.getView().addDependent(this._dialog);
                    BusyIndicator.hide();
                   
                }
                this._dialog.getModel("ChartModelFullData").setData(arr);
                this._dialog.getModel("ChartModelFullData").refresh(true);
                this._dialog.open();
               
                    var vizframe = sap.ui.getCore().byId("allDataShowInId");
                    vizframe.setVizProperties({
                        title:{
                            text:"Details"
                        },
                        plotArea: {
                            colorPalette: ["#65B741","#FAA300","#5356FF"],
                            drawingEffect: "glossy"
                        }
                })
               
            }
        });
    });
