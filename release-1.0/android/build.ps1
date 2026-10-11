$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$toolRoot=Join-Path (Split-Path (Split-Path $project -Parent) -Parent) 'miaoye/.sites-runtime/android-tools'
$jdk=(Get-ChildItem (Join-Path $toolRoot 'jdk') -Directory | Select-Object -First 1).FullName
$tools=Join-Path $toolRoot 'tools/android-15'
$platform=Join-Path $toolRoot 'platform/android-35/android.jar'
Set-Location -LiteralPath $project
$build='.sites-runtime/android-build-v101'
$env:JAVA_HOME=$jdk
$env:PATH=(Join-Path $jdk 'bin')+';'+$env:PATH
foreach($dir in @('assets/web','classes','dex')){New-Item -ItemType Directory -Force (Join-Path $build $dir) | Out-Null}
$assetRoot=Join-Path $build 'assets/web'
Get-ChildItem (Join-Path $project 'web') -File | Where-Object {$_.Extension -in @('.html','.js','.css')} | Copy-Item -Destination $assetRoot -Force
New-Item -ItemType Directory -Force (Join-Path $assetRoot 'assets') | Out-Null
foreach($name in @('cat-actions-v22.png','stickers-v14.webp','handwriting.ttf','handwriting-license.txt','app-icon.svg')){Copy-Item -LiteralPath (Join-Path $project ('web/assets/'+$name)) -Destination (Join-Path $assetRoot 'assets') -Force}
function Check-Exit {if($LASTEXITCODE -ne 0){throw "Android build command failed: $LASTEXITCODE"}}
& (Join-Path $jdk 'bin/javac.exe') -encoding UTF-8 -source 8 -target 8 -bootclasspath $platform -d (Join-Path $build 'classes') (Get-ChildItem (Join-Path $PSScriptRoot 'src/com/miaoye/journal') -Filter '*.java' | ForEach-Object {$_.FullName});Check-Exit
& (Join-Path $tools 'aapt2.exe') compile --dir 'android/res' -o (Join-Path $build 'resources.zip');Check-Exit
& (Join-Path $tools 'aapt2.exe') link -o (Join-Path $build 'base.apk') --manifest 'android/AndroidManifest.xml' -I $platform -R (Join-Path $build 'resources.zip') --auto-add-overlay -0 html -0 js -0 css;Check-Exit
# JDK jar writes portable slash-delimited ZIP names; Windows aapt2 -A does not.
& (Join-Path $jdk 'bin/jar.exe') uf0 (Join-Path $build 'base.apk') -C $build assets;Check-Exit
$classes=Get-ChildItem (Join-Path $build 'classes') -Filter '*.class' -Recurse | ForEach-Object {$_.FullName}
& (Join-Path $tools 'd8.bat') --min-api 26 --lib $platform --output (Join-Path $build 'dex') $classes;Check-Exit
& (Join-Path $jdk 'bin/jar.exe') uf (Join-Path $build 'base.apk') -C (Join-Path $build 'dex') classes.dex;Check-Exit
& (Join-Path $tools 'zipalign.exe') -f 4 (Join-Path $build 'base.apk') (Join-Path $build 'aligned.apk');Check-Exit
$key=Join-Path $toolRoot 'miaoye-test.keystore'
if(-not(Test-Path -LiteralPath $key)){& (Join-Path $jdk 'bin/keytool.exe') -genkeypair -keystore $key -storepass android -keypass android -alias miaoye-test -dname 'CN=Miaoye Test, O=Miaoye, C=SG' -keyalg RSA -keysize 2048 -validity 10000;Check-Exit}
$downloads='web/downloads'
New-Item -ItemType Directory -Force $downloads | Out-Null
$apk=Join-Path $downloads 'miaoye-1.0.1.apk'
& (Join-Path $tools 'apksigner.bat') sign --v4-signing-enabled false --ks $key --ks-pass pass:android --ks-key-alias miaoye-test --out $apk (Join-Path $build 'aligned.apk');Check-Exit
& (Join-Path $tools 'apksigner.bat') verify --verbose $apk;Check-Exit
New-Item -ItemType Directory -Force (Join-Path $build 'verification') | Out-Null
& (Join-Path $jdk 'bin/javac.exe') -encoding UTF-8 -cp (Join-Path $build 'classes') -d (Join-Path $build 'verification') (Join-Path $PSScriptRoot 'tests/LocalPagesTest.java');Check-Exit
& (Join-Path $jdk 'bin/java.exe') -cp ((Join-Path $build 'classes')+';'+(Join-Path $build 'verification')) LocalPagesTest $apk;Check-Exit
& (Join-Path $tools 'aapt2.exe') dump badging $apk;Check-Exit
Get-FileHash -LiteralPath $apk -Algorithm SHA256
