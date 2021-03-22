const fs = require('fs');
const pth = require('path');
global.src_root_pref = 'src/';
module.exports = {
  root: ['./src'],

  filters: {
    random_file: function (path='./', ext=['png', 'jpg']) {
      let arr = fs.readdirSync(src_root_pref + path);
      let filesMatch = new Array(0);
      for (let i = 0; i < ext.length; i++) {
        filesMatch = filesMatch.concat(arr.filter(el=>new RegExp('\\.'+ext[i]+'$', flags='g').test(el)));
      }
      let el = filesMatch[Math.floor(Math.random()*filesMatch.length)];
      return pth.join(path, el).replace(/\\/g, '/');
    },
    shorten: function (str, length=20) {
      let result = str.slice(0, length);
      return result === str ? result : result + '...';
    },
    safe_import: function (filepath) {
      if (fs.existsSync(src_root_pref+filepath)) {
        return filepath;
      } else  {
        return '#';
      }
    },
    isObj: function (obj) {
      return typeof obj === "object";
    }
  },
  data: {
      name: process.env.USER,
      menu_left_content: [{
          name:"Ecommerce", collapse: true, "fa-icon": "fa-home", data: [
            {name: "Dashboard v.1", link: "index.html", "fa-icon": "fa-bullseye"},
            {name: "Dashboard v.2", link: "index-1.html", "fa-icon": "fa-circle-o"},
            {name: "Dashboard v.3", link: "index-2.html", "fa-icon": "fa-cube"},
            {name: "Product List", link: "product-list.html", "fa-icon": "fa-female"},
            {name: "Product Edit", link: "product-edit.html", "fa-icon": "fa-bolt"},
            {name: "Product Detail", link: "product-detail.html", "fa-icon": "fa-heart-o"},
            {name: "Product Cart", link: "product-cart.html", "fa-icon": "fa-level-down"},
            {name: "Product Payment", link: "product-payment.html", "fa-icon": "fa-location-arrow"},
            {name: "Analytics", link: "analytics.html", "fa-icon": "fa-line-chart"},
            {name: "Widgets", link: "widgets.html", "fa-icon": "fa-magnet"},
        ]
        }, {
          name: "Mailbox", collapse: true, "fa-icon": "fa-envelope", data: [
            {name: "Inbox", link: "mailbox.html", "fa-icon": "fa-inbox"},
            {name: "View Mail", link: "mailbox-view.html", "fa-icon": "fa-television"},
            {name: "Compose Mail", link: "mailbox-compose.html", "fa-icon": "fa-paper-plane"},
        ]}, {
          name: "Interface", collapse: true, "fa-icon": "fa-flask", data: [
            {name: "Google Map", link: "google-map.html", "fa-icon": "fa-map-marker"},
            {name: "Data Maps", link: "data-maps.html", "fa-icon": "fa-map-o"},
            {name: "Pdf Viewer", link: "pdf-viewer.html", "fa-icon": "fa-file-pdf-o"},
            {name: "X-Editable", link: "x-editable.html", "fa-icon": "fa-fighter-jet"},
            {name: "Code Editor", link: "code-editor.html", "fa-icon": "fa-code"},
            {name: "Tree View", link: "tree-view.html", "fa-icon": "fa-frown-o"},
            {name: "Preloader", link: "preloader.html", "fa-icon": "fa-circle"},
            {name: "Images Cropper", link: "images-cropper.html", "fa-icon": "fa-file-image-o"},
        ]}, {
          name: "Miscellaneous", collapse: true, "fa-icon": "fa-pie-chart", data: [
            {name: "File Manager", link: "file-manager.html", "fa-icon": "fa-folder"},
            {name: "Blog", link: "blog.html", "fa-icon": "fa-square"},
            {name: "Blog Details", link: "blog-details.html", "fa-icon": "fa-tags"},
            {name: "404 Page", link: "404.html", "fa-icon": "fa-tint"},
            {name: "500 Page", link: "500.html", "fa-icon": "fa-tree"},
        ]}, {
          name: "Charts", collapse: true, "fa-icon": "fa-bar-chart-o", data: [
            {name: "Bar Charts", link: "bar-charts.html", "fa-icon": "fa-line-chart"},
            {name: "Line Charts", link: "line-charts.html", "fa-icon": "fa-area-chart"},
            {name: "Rounded Chart", link: "rounded-chart.html", "fa-icon": "fa-signal"},
            {name: "C3 Charts", link: "c3.html", "fa-icon": "fa-barcode"},
            {name: "Sparkline Charts", link: "sparkline.html", "fa-icon": "fa-sort-amount-desc"},
            {name: "Peity Charts", link: "peity.html", "fa-icon": "fa-object-ungroup"},
        ]}, {
          name: "Data Tables", collapse: true, "fa-icon": "fa-table", data: [
            {name: "Static Table", link: "static-table.html", "fa-icon": "fa-table"},
            {name: "Data Table", link: "data-table.html", "fa-icon": "fa-th"},
        ]}, {
          name: "Forms Elements", collapse: true, "fa-icon": "fa-table", data: [
            {name: "Bc Form Elements", link: "basic-form-element.html", "fa-icon": "fa-pencil"},
            {name: "Ad Form Elements", link: "advance-form-element.html", "fa-icon": "fa-lightbulb-o"},
            {name: "Password Meter", link: "password-meter.html", "fa-icon": "fa-hourglass"},
            {name: "Multi Upload", link: "multi-upload.html", "fa-icon": "fa-hdd-o"},
            {name: "Text Editor", link: "tinymc.html", "fa-icon": "fa-globe"},
            {name: "Dual List Box", link: "dual-list-box.html", "fa-icon": "fa-hand-paper-o"},
        ]}, {
          name: "App Views", collapse: true, "fa-icon": "fa-desktop", data: [
            {name: "Notifications", link: "notifications.html", "fa-icon": "fa-external-link-square"},
            {name: "Alerts", link: "alerts.html", "fa-icon": "fa-crop"},
            {name: "Modals", link: "modals.html", "fa-icon": "fa-building"},
            {name: "Buttons", link: "buttons.html", "fa-icon": "fa-adjust"},
            {name: "Tabs", link: "tabs.html", "fa-icon": "fa-eye"},
            {name: "Accordion", link: "accordion.html", "fa-icon": "fa-life-ring"},
        ]}, {
          name: "Pages", collapse: true, "fa-icon": "fa-files-o", data: [
            {name: "Login", link: "login.html", "fa-icon": "fa-hand-rock-o"},
            {name: "Register", link: "register.html", "fa-icon": "fa-plane"},
            {name: "Lock", link: "lock.html", "fa-icon": "fa-file"},
            {name: "Password Recovery", link: "password-recovery.html", "fa-icon": "fa-wheelchair"},
        ]}, {
          name: "Landing Page", collapse: false, "fa-icon": "fa-bookmark", link: "index.html"
        }
      ],
      messages: [{
        name: "Advanda Cro", photo: "", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }, {
        name: "Sulaiman Din", photo: "", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }, {
        name: "Victor Jara", photo: "", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }, {
        name: "Victor Jara", photo: "", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }],
      notifications: [{
        name: "Advanda Cro", type: "success", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }, {
        name: "Sulaiman Din", type: "cloud-disk", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }, {
        name: "Victor Jara", type: "erase", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }, {
        name: "Victor Jara", type: "stonks", date: "16 Sept", short_descr: "Please done this project as soon as possible"
      }]
    },
}
