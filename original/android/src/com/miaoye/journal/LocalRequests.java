package com.miaoye.journal;

/** Routing shared by startup, resource interception and page navigation. */
public final class LocalRequests {
  public static final String HOST = "appassets.androidplatform.net";
  public static final String HOME_URL = "https://" + HOST + "/index.html";
  public enum Route { LOCAL, EMBEDDED, BLOCKED }
  private LocalRequests() {}

  public static Route route(String scheme, String host, String path) {
    // WebView also intercepts data: resources. They never need a network response.
    if ("data".equals(scheme) || "blob".equals(scheme) || "about".equals(scheme)) return Route.EMBEDDED;
    if (!"https".equals(scheme) || !HOST.equals(host)) return Route.BLOCKED;
    if (path != null && (path.contains("..") || path.contains("\\"))) return Route.BLOCKED;
    return Route.LOCAL;
  }

  public static String pagePath(String path) {
    return path == null || path.isEmpty() || "/".equals(path) ? "/index.html" : path;
  }
}
