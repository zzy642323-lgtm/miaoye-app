import com.miaoye.journal.LocalPages;
import com.miaoye.journal.LocalRequests;
import java.net.URI;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.zip.*;
public final class LocalPagesTest {
  public static void main(String[] args) throws Exception {
    checkRoute(LocalRequests.HOME_URL, LocalRequests.Route.LOCAL);
    checkRoute("https://appassets.androidplatform.net/", LocalRequests.Route.LOCAL);
    checkRoute("https://appassets.androidplatform.net/app.js?v=14", LocalRequests.Route.LOCAL);
    checkRoute("data:text/html;charset=utf-8;base64,PGh0bWw+", LocalRequests.Route.EMBEDDED);
    checkRoute("data:image/png;base64,aGVsbG8=", LocalRequests.Route.EMBEDDED);
    checkRoute("blob:https://appassets.androidplatform.net/local-photo", LocalRequests.Route.EMBEDDED);
    checkRoute("about:blank", LocalRequests.Route.EMBEDDED);
    checkRoute("https://example.com/app.js", LocalRequests.Route.BLOCKED);
    checkRoute("https://appassets.androidplatform.net.example.com/index.html", LocalRequests.Route.BLOCKED);
    checkRoute("http://appassets.androidplatform.net/index.html", LocalRequests.Route.BLOCKED);
    checkRoute("file:///sdcard/index.html", LocalRequests.Route.BLOCKED);
    checkRoute("https://appassets.androidplatform.net/%2e%2e/AndroidManifest.xml", LocalRequests.Route.BLOCKED);
    String apk = args[0]; int checked = 0;
    URI home = URI.create(LocalRequests.HOME_URL);
    try(InputStream in = LocalPages.open(apk,"web" + LocalRequests.pagePath(home.getPath()))) {
      if(in.read()!='<') throw new AssertionError("Startup route does not serve HTML");
    }
    if(!"/index.html".equals(LocalRequests.pagePath("/"))) throw new AssertionError("Root must resolve to homepage");
    Set<String> required = new HashSet<>(Arrays.asList("assets/web/index.html", "assets/web/app.js", "assets/web/android-config.js", "assets/web/v14.css", "assets/web/assets/cat-actions-v14.webp"));
    try (ZipFile zip = new ZipFile(apk)) {
      Enumeration<? extends ZipEntry> entries = zip.entries();
      while(entries.hasMoreElements()) {
        ZipEntry entry = entries.nextElement();
        if(entry.getName().contains("\\")) throw new AssertionError("Non-portable ZIP path: " + entry.getName());
        if(!entry.getName().startsWith("assets/web/") || entry.isDirectory()) continue;
        required.remove(entry.getName());
        try(InputStream in = LocalPages.open(apk, entry.getName().substring(7))) {
          ByteArrayOutputStream out = new ByteArrayOutputStream(); byte[] buffer = new byte[8192]; int n;
          while((n=in.read(buffer))!=-1) out.write(buffer,0,n);
          if(out.size()!=entry.getSize()) throw new AssertionError("Truncated " + entry.getName());
          if(entry.getName().endsWith("/index.html")) {
            String html = new String(out.toByteArray(),StandardCharsets.UTF_8);
            if(!html.contains("android-config.js") || !html.contains("app.js?v=14")) throw new AssertionError("Missing startup scripts");
            if(entry.getMethod()!=ZipEntry.STORED) throw new AssertionError("Home page should be uncompressed");
          }
        } checked++;
      }
    }
    if(!required.isEmpty()) throw new AssertionError("Missing assets: " + required);
    try { LocalPages.open(apk,"web/../AndroidManifest.xml"); throw new AssertionError("Traversal accepted"); } catch(IOException expected) {}
    System.out.println("Verified APK local page reader: " + checked + " complete web assets");
    System.out.println("Verified startup, embedded photos and offline request routing: 12 cases");
  }
  private static void checkRoute(String url, LocalRequests.Route expected) {
    URI uri = URI.create(url);
    if(LocalRequests.route(uri.getScheme(),uri.getHost(),uri.getPath())!=expected) throw new AssertionError("Wrong request route: " + url);
  }
}
