import { assertSharedAppChecks, createChecker, readMobileProject } from "./mobile-readiness-lib.mjs";

const checker = createChecker("Android App");
const project = readMobileProject();
const scripts = project.mobilePackage.scripts || {};
const android = project.manifest["app-plus"]?.distribute?.android || {};
const packageName = android.package || "";
const permissions = android.permissions || [];
const forbiddenPermissions = [
  "CAMERA",
  "GET_ACCOUNTS",
  "READ_LOGS",
  "READ_PHONE_STATE",
  "WRITE_EXTERNAL_STORAGE",
  "WRITE_SETTINGS"
];

function hasPermission(permissionName) {
  return permissions.some((item) => String(item).includes(`android.permission.${permissionName}`));
}

checker.assert("App build script exists", Boolean(scripts["build:app-android"] || scripts["build:app"]));
checker.assert("Android package name is configured", /^([a-z][a-z0-9_]*\.)+[a-z][a-z0-9_]*$/.test(packageName), packageName);
checker.assert("Android minSdkVersion is set", Number(android.minSdkVersion) >= 23, String(android.minSdkVersion || ""));
checker.assert("Android targetSdkVersion is set", Number(android.targetSdkVersion) >= 35, String(android.targetSdkVersion || ""));
checker.assert("Android INTERNET permission is declared", hasPermission("INTERNET"));
checker.assert("Android ACCESS_NETWORK_STATE permission is declared", hasPermission("ACCESS_NETWORK_STATE"));
checker.assert(
  "Android sensitive template permissions are removed",
  !forbiddenPermissions.some(hasPermission),
  forbiddenPermissions.filter(hasPermission).join(", ")
);
assertSharedAppChecks(checker, project);
checker.report();
