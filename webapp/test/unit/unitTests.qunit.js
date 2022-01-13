/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comitsgrp.brz.jornada./its-brzjornadas/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
