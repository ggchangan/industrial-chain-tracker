import { assertSharedAppChecks, createChecker, readMobileProject } from "./mobile-readiness-lib.mjs";

const checker = createChecker("iOS App");
const project = readMobileProject();
const scripts = project.mobilePackage.scripts || {};
const ios = project.manifest["app-plus"]?.distribute?.ios || {};
const bundleId = project.manifest["app-plus"]?.distribute?.apple?.bundleId || ios.id || "";

checker.assert("App build script exists", Boolean(scripts["build:app-ios"] || scripts["build:app"]));
checker.assert("iOS Bundle ID is configured", /^([A-Za-z0-9-]+\.)+[A-Za-z0-9-]+$/.test(bundleId), bundleId);
checker.assert("iOS deployment target is set", Boolean(ios.deploymentTarget), ios.deploymentTarget || "");
checker.assert("iOS universal device target is set", ios.devices === "universal", ios.devices || "");
assertSharedAppChecks(checker, project);
checker.report();
