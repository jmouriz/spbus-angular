#!/bin/bash
#base=
#source=$base/dist/webapp
target=web/spbus.com.ar/app
rm -rf dist/webapp
rm dist/*.zip
ng build --prod --base-href /app/ --deploy-url /app/
cd dist/webapp
sed -i -e 's:<link.*=.favicon.ico..*>:<script src="../cordova.js"></script>:g' index.html
cp ../../cordova.js .
minify index.html > index.min.html
mv index.min.html index.html
rm -rf assets
rm *.txt
rm favicon.ico
rm index.html-e
zip -9 -r ../bus.zip *  
cd -
rm -f ../cordova/www/app/*
cp dist/webapp/* ../cordova/www/app
mv ../cordova/www/app/index.html ../cordova/www
rm ../cordova/www/app/cordova.js
scp dist/bus.zip gaia:/home/juanma
ssh gaia "cd $target; rm -f *; mv ~/bus.zip .; unzip bus.zip; rm bus.zip"