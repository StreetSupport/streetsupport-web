[1mdiff --git a/src/js/page-category-by-location.js b/src/js/page-category-by-location.js[m
[1mindex c9bee91..1ca18c5 100644[m
[1m--- a/src/js/page-category-by-location.js[m
[1m+++ b/src/js/page-category-by-location.js[m
[36m@@ -2,20 +2,19 @@[m
 [m
 import './common'[m
 [m
[31m-let FindHelp = require('./find-help')[m
[32m+[m[32mconst FindHelp = require('./find-help')[m
 [m
[31m-let marked = require('marked')[m
[32m+[m[32mconst marked = require('marked')[m
 marked.setOptions({sanitize: true})[m
 [m
[31m-let getApiData = require('./get-api-data')[m
[31m-let querystring = require('./get-url-parameter')[m
[31m-let templating = require('./template-render')[m
[31m-let analytics = require('./analytics')[m
[31m-let socialShare = require('./social-share')[m
[31m-let browser = require('./browser')[m
[31m-let locationSelector = require('./location/locationSelector')[m
[32m+[m[32mconst getApiData = require('./get-api-data')[m
[32m+[m[32mconst querystring = require('./get-url-parameter')[m
[32m+[m[32mconst templating = require('./template-render')[m
[32m+[m[32mconst analytics = require('./analytics')[m
[32m+[m[32mconst socialShare = require('./social-share')[m
[32m+[m[32mconst browser = require('./browser')[m
[32m+[m[32mconst locationSelector = require('./location/locationSelector')[m
 let findHelp = null[m
[31m-let currentLocation = null[m
 [m
 import { buildFindHelpUrl, buildInfoWindowMarkup } from './pages/find-help/by-location/helpers'[m
 [m
[36m@@ -52,6 +51,7 @@[m [mconst initMap = (providers, userLocation) => {[m
         map: map,[m
         title: `${p.serviceProviderName}`[m
       })[m
[32m+[m
       marker.addListener('click', () => {[m
         infoWindows[m
           .forEach((w) => w.close())[m
[36m@@ -104,7 +104,7 @@[m [mconst renderResults = (locationResult, result) => {[m
     categoryId: result.data.category.id,[m
     categoryName: result.data.category.name,[m
     categorySynopsis: marked(result.data.category.synopsis),[m
[31m-    location: currentLocation.name[m
[32m+[m[32m    location: locationResult.name[m
   }[m
   templating.renderTemplate(template, viewModel, 'js-category-result-output', onRenderCallback)[m
 }[m
[36m@@ -119,14 +119,16 @@[m [mconst buildList = (locationResult) => {[m
   })[m
 }[m
 [m
[31m-browser.loading()[m
[31m-locationSelector[m
[31m-  .getCurrent()[m
[31m-  .then((result) => {[m
[31m-    currentLocation = result[m
[31m-    findHelp = new FindHelp(result.findHelpId)[m
[31m-    let reqSubCat = querystring.parameter('sub-category')[m
[31m-    findHelp.setUrl('category', 'sub-category', reqSubCat)[m
[31m-    buildList(result)[m
[31m-  }, (_) => {[m
[31m-  })[m
[32m+[m[32mconst init = () => {[m
[32m+[m[32m  browser.loading()[m
[32m+[m[32m  locationSelector[m
[32m+[m[32m    .getCurrent()[m
[32m+[m[32m    .then((locationResult) => {[m
[32m+[m[32m      findHelp = new FindHelp(locationResult.findHelpId)[m
[32m+[m[32m      findHelp.setUrl('category', 'sub-category', querystring.parameter('sub-category'))[m
[32m+[m[32m      buildList(locationResult)[m
[32m+[m[32m    }, (_) => {[m
[32m+[m[32m    })[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32minit()[m
\ No newline at end of file[m
[1mdiff --git a/src/pages/find-help/category/index.hbs b/src/pages/find-help/category/index.hbs[m
[1mindex 23ba2f8..1e0e660 100644[m
[1m--- a/src/pages/find-help/category/index.hbs[m
[1m+++ b/src/pages/find-help/category/index.hbs[m
[36m@@ -110,7 +110,7 @@[m [mpage: category[m
                       \{{#days}}[m
                       <dt class="result-detail__times-title">\{{day}}</dt>[m
                       \{{#openingTimes}}[m
[31m-                      <dd class="result-detail__times-item">\{{ . }}</dd>[m
[32m+[m[32m                      <dd class="result-detail__times-item result-detail__times-item--provider-listing">\{{ . }}</dd>[m
                       \{{/openingTimes}}[m
                       \{{/days}}[m
                     </dl>[m
[1mdiff --git a/src/scss/partials/_result-detail.scss b/src/scss/partials/_result-detail.scss[m
[1mindex 221de8e..9cc47aa 100644[m
[1m--- a/src/scss/partials/_result-detail.scss[m
[1m+++ b/src/scss/partials/_result-detail.scss[m
[36m@@ -79,6 +79,9 @@[m
     &--timetabled {[m
       margin-left: 0[m
     }[m
[32m+[m[32m    &--provider-listing {[m
[32m+[m[32m      margin-left: 160px[m
[32m+[m[32m    }[m
   }[m
 [m
   &__provider-tag-list {[m
