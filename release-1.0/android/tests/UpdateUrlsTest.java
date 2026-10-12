package com.miaoye.journal;
public class UpdateUrlsTest {
 public static void main(String[] args){
  String[] good={UpdateUrls.PRIMARY,UpdateUrls.BACKUP,"https://s7ianzbg94fw.meoo.run/downloads/miaoye-1.0.13.apk","https://github.com/zzy642323-lgtm/miaoye-app/releases/download/v1.0.13/miaoye-1.0.13.apk","https://release-assets.githubusercontent.com/github-production-release-asset/a?sig=test"};
  String[] bad={"http://s7ianzbg94fw.meoo.run/version.json","https://evil.test/update.apk","https://github.com/other/repo/releases/download/v1/update.apk","https://s7ianzbg94fw.meoo.run@evil.test/version.json","https://github.com:8443/zzy642323-lgtm/miaoye-app/releases/download/v1.0.13/miaoye-1.0.13.apk","https://s7ianzbg94fw.meoo.run/downloads/miaoye-1.0.13.apk?x=1","https://raw.githubusercontent.com/other/repo/main/version.json"};
  for(String s:good)if(!UpdateUrls.allowed(s))throw new AssertionError("Rejected trusted URL");
  for(String s:bad)if(UpdateUrls.allowed(s))throw new AssertionError("Accepted untrusted URL");
  if(UpdateUrls.packageURL(good[3],"1.0.12"))throw new AssertionError("Wrong version accepted");
  if(!UpdateUrls.packageURL(good[3],"1.0.13"))throw new AssertionError("Release rejected");
  System.out.println("Verified release URL policy: 14 cases");
 }
}
