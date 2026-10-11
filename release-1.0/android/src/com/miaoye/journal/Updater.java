package com.miaoye.journal;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.*;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.*;
import java.io.*;
import java.net.*;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.concurrent.*;
import org.json.*;

/** Updates from the app's HTTPS release service; verifies hash, package and signer. */
public final class Updater {
  private static final String ORIGIN="https://s7ianzbg94fw.meoo.run";
  private final Activity activity;private final WebView web;
  private final ExecutorService executor=Executors.newSingleThreadExecutor();
  private volatile JSONObject manifest;private volatile boolean verified=false;
  Updater(Activity a,WebView w){activity=a;web=w;}
  @JavascriptInterface public String info(){try{PackageInfo p=activity.getPackageManager().getPackageInfo(activity.getPackageName(),0);return new JSONObject().put("version",p.versionName).put("versionCode",p.versionCode).toString();}catch(Exception e){return "{}";}}
  private void reply(final String kind,final Object value){activity.runOnUiThread(new Runnable(){public void run(){if(!activity.isDestroyed()&&web.getUrl()!=null&&web.getUrl().startsWith("https://"+LocalRequests.HOST+"/"))web.evaluateJavascript("window.miaoyeUpdateReply&&window.miaoyeUpdateReply("+JSONObject.quote(kind)+","+(value instanceof JSONObject?value.toString():JSONObject.quote(String.valueOf(value)))+")",null);}});}
  private HttpURLConnection connect(String url) throws IOException {
    URL u=new URL(url);if(!"https".equals(u.getProtocol())||!"s7ianzbg94fw.meoo.run".equals(u.getHost())||u.getPort()!=-1||u.getUserInfo()!=null)throw new IOException("Invalid release URL");
    HttpURLConnection c=(HttpURLConnection)u.openConnection();c.setInstanceFollowRedirects(false);c.setConnectTimeout(15000);c.setReadTimeout(60000);c.setRequestProperty("Cache-Control","no-cache");if(c.getResponseCode()!=200){c.disconnect();throw new IOException("Release unavailable");}return c;
  }
  @JavascriptInterface public void check(){executor.execute(new Runnable(){public void run(){try{
    HttpURLConnection c=connect(ORIGIN+"/version.json");ByteArrayOutputStream b=new ByteArrayOutputStream();try(InputStream in=c.getInputStream()){byte[] block=new byte[2048];int n;while((n=in.read(block))!=-1){if(b.size()+n>16384)throw new IOException("Manifest too large");b.write(block,0,n);}}finally{c.disconnect();}
    JSONObject m=new JSONObject(b.toString("UTF-8"));String version=m.getString("version"),url=m.getString("url");
    if(!version.matches("[0-9]+\\.[0-9]+\\.[0-9]+")||!url.equals(ORIGIN+"/downloads/miaoye-"+version+".apk")||!m.getString("sha256").matches("[0-9a-f]{64}")||m.getInt("versionCode")<1)throw new IOException("Invalid manifest");manifest=m;reply("version",m);
  }catch(Exception e){reply("error","暂时连接不上更新服务，请稍后再试。");}}});}
  private static String hex(byte[] value){StringBuilder s=new StringBuilder();for(byte b:value)s.append(String.format("%02x",b&255));return s.toString();}
  private void verify(File file,JSONObject m) throws Exception {
    MessageDigest digest=MessageDigest.getInstance("SHA-256");try(InputStream in=new FileInputStream(file)){byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1)digest.update(b,0,n);}if(!hex(digest.digest()).equals(m.getString("sha256")))throw new IOException("Hash mismatch");
    PackageManager pm=activity.getPackageManager();PackageInfo installed=pm.getPackageInfo(activity.getPackageName(),PackageManager.GET_SIGNATURES),next=pm.getPackageArchiveInfo(file.getAbsolutePath(),PackageManager.GET_SIGNATURES);
    if(next==null||!activity.getPackageName().equals(next.packageName)||next.versionCode!=m.getInt("versionCode")||next.versionCode<=installed.versionCode||!Arrays.equals(installed.signatures,next.signatures))throw new IOException("Package mismatch");
  }
  @JavascriptInterface public void download(){executor.execute(new Runnable(){public void run(){File part=null;try{JSONObject m=manifest;if(m==null)throw new IOException("Check version first");verified=false;File folder=new File(activity.getCacheDir(),"updates");folder.mkdirs();part=new File(folder,"update.part");HttpURLConnection c=connect(m.getString("url"));reply("progress","正在下载更新…");try(InputStream in=c.getInputStream();OutputStream out=new FileOutputStream(part)){byte[] b=new byte[8192];int n,total=0;while((n=in.read(b))!=-1){total+=n;if(total>30*1024*1024)throw new IOException("Update too large");out.write(b,0,n);}}finally{c.disconnect();}verify(part,m);File ready=new File(folder,"update.apk");if(ready.exists()&&!ready.delete())throw new IOException("Cannot replace update");if(!part.renameTo(ready))throw new IOException("Cannot save update");verified=true;activity.runOnUiThread(new Runnable(){public void run(){install();}});}catch(Exception e){if(part!=null)part.delete();reply("error","下载或校验失败，请重新检查版本后再试。");}}});}
  void install(){if(!verified)return;try{if(!activity.getPackageManager().canRequestPackageInstalls()){reply("progress","更新已校验，请允许安装应用更新，再返回喵页。");activity.startActivityForResult(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+activity.getPackageName())),4);return;}Uri uri=Uri.parse("content://"+activity.getPackageName()+".update/update.apk");Intent intent=new Intent(Intent.ACTION_VIEW);intent.setDataAndType(uri,"application/vnd.android.package-archive");intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);activity.startActivity(intent);reply("progress","更新已准备好，请在系统界面确认安装。");}catch(Exception e){reply("error","无法打开安装界面，请稍后重试。");}}
  void shutdown(){executor.shutdownNow();}
}

