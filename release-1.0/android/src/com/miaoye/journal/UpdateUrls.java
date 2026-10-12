package com.miaoye.journal;
import java.net.URI;
final class UpdateUrls {
 static final String PRIMARY="https://s7ianzbg94fw.meoo.run/version.json";
 static final String BACKUP="https://raw.githubusercontent.com/zzy642323-lgtm/miaoye-app/main/release-1.0/web/version-github.json";
 static boolean allowed(String value){try{URI u=new URI(value);if(!"https".equals(u.getScheme())||u.getPort()!=-1||u.getUserInfo()!=null||u.getFragment()!=null)return false;
  String host=u.getHost(),path=u.getPath();
  if(value.equals(PRIMARY)||value.equals(BACKUP))return true;
  if("release-assets.githubusercontent.com".equals(host))return true;
  if(u.getRawQuery()!=null)return false;
  if("s7ianzbg94fw.meoo.run".equals(host))return path.matches("/downloads/miaoye-[0-9]+\\.[0-9]+\\.[0-9]+\\.apk");
  return "github.com".equals(host)&&path.matches("/zzy642323-lgtm/miaoye-app/releases/download/v[0-9]+\\.[0-9]+\\.[0-9]+/miaoye-[0-9]+\\.[0-9]+\\.[0-9]+\\.apk");
 }catch(Exception e){return false;}}
 static boolean packageURL(String url,String version){return url.equals("https://s7ianzbg94fw.meoo.run/downloads/miaoye-"+version+".apk")||url.equals("https://github.com/zzy642323-lgtm/miaoye-app/releases/download/v"+version+"/miaoye-"+version+".apk");}
}

