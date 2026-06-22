async function startApplication() {
  try {
    const response = await fetch("./api/v1/library", {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    window.INDUSTRY_CHAIN_LIBRARY = await response.json();
    document.documentElement.dataset.dataSource = "api";
  } catch (error) {
    document.documentElement.dataset.dataSource = "static";
    console.info("Using static library fallback:", error.message);
  }

  await import("./app.js?v=research-activity-1");
}

startApplication();
