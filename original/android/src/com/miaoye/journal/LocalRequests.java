package com.miaoye.journal;

/** Routing shared by startup, resource interception and page navigation. */
public final class LocalRequests {
  public static final String HOST = "appassets.androidplatform.net";
  public static final String HOME_URL = "https://" + HOST + "/index.html";
  public enum Route { LOCAL, EMBEDDED, CLOUD, BLOCKED }
  private LocalRequests() {}

  public static Route route(String scheme, String host, String path) {
    // WebView also intercepts data: resources. They never need a network response.
    if ("data".equals(scheme) || "blob".equals(scheme) || "about".equals(scheme)) return Route.EMBEDDED;
    if ("https".equals(scheme) && "s7ianzbg94fw.meoo.run".equals(host) && path != null && path.startsWith("/cloud/") && !path.contains("..") && !path.contains("\\")) return Route.CLOUD;
    if (!"https".equals(scheme) || !HOST.equals(host)) return Route.BLOCKED;
    if (path != null && (path.contains("..") || path.contains("\\"))) return Route.BLOCKED;
    return Route.LOCAL;
  }

  public static boolean cloudURL(String value) {
    try { java.net.URI u=new java.net.URI(value);String path=u.getRawPath();return "https".equals(u.getScheme())&&"s7ianzbg94fw.meoo.run".equals(u.getHost())&&(u.getPort()==-1||u.getPort()==443)&&u.getUserInfo()==null&&u.getFragment()==null&&path!=null&&path.startsWith("/cloud/")&&!path.contains("%")&&!path.contains("..")&&!path.contains("\\"); } catch(Exception e) { return false; }
  }

  public static String pagePath(String path) {
    return path == null || path.isEmpty() || "/".equals(path) ? "/index.html" : path;
  }
}
