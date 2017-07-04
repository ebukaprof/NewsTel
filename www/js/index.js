/*
* 27th april 2014
* Code written by Olayiwola Funsho
* This file handles cordova/phone gap related codes.
*/

/*GLOBAL VARIABLES AND CONSTANTS*/
var SITE_URL = "http://www.newtelegraphonline.com/";
var URL = "http://www.newtelegraphonline.com/";



var db;
var idbSupported = false;
var CURRENT_ITEM_ID;
var newsitems_arr = new Array();
var CURRENT_ITEM_TITLE = "";

var share_title = "New Telegraph Newspaper For Windows Phone 8";
var share_text = "Download on Windows Appstore";
var FATAL_ERROR = "Sorry, seems this application cannot run on your device. Please contact support@newtelegraphonline.com.ng and provide your device manufacturer and model. Thank you. ";
var LOAD_FAILED_MSG = "Request Failed. Please make sure you are connected to the Internet and try again";
var SERVER_UNREACHABLE = "Server unreachable. Please try again later.";


var ALERT_DURATION = 600000;
ALERT_DURATION = 20000;
var allow_sound = allow_vibrate = "yes";
var LAST_ALERT_ID = 0;
var MY_INTERVAL;
var CURRENT_PAGE = FONTSIZE = 1;
var FETCH_LIMIT = 15;

var ALLOW_UPDATE = 1;

var DEVICE;

/*cache for images */
var img_preload = new Image();


function load_app() {


    document.addEventListener("deviceready", load_db, true);
    //document.addEventListener("menubutton", show_app_menu, false);
    document.addEventListener("backbutton", go_back);

}

function show_app_menu() {
    af.ui.toggleSideMenu();
}

function go_back() {
    var id = $.ui.activeDiv.id;

    if (id == "main") {
        exitApp();
    }
    else {
        $.ui.goBack();
    }
}





/************************************* DATABASE SECTION **********************************************************/
/* Loads database */
function load_db() {



    /*append device details to url. statistics purposes*/
    //URL = URL+ '&d_name='+ device.name+ '&d_platform=' + device.platform + '&d_model=' + device.model + '&d_version=' + device.version + '&d_uuid=' + device.uuid;
    /*
	db = window.openDatabase("Newtelegraph", "1.0", "Newtelegraph", 7000000);
    db.transaction(populateDB, errorCBCreate, successCB);   
	*/
    /*checkConnection();*/

    if ("indexedDB" in window) {
        idbSupported = true;
    }

    if (idbSupported) {
        var openRequest = indexedDB.open("Newtelegraph", 3);

        openRequest.onupgradeneeded = function (e) {
            try {
                console.log("Upgrading...");

                db = e.target.result;

                if (!db.objectStoreNames.contains("Settings")) {
                    var store = db.createObjectStore("Settings");
                    store.createIndex('about_app', 'about_app', { unique: false });
                    store.createIndex('font_size', 'font_size', { unique: false });
                    store.createIndex('update_on_startup', 'update_on_startup', { unique: false });
                    store.createIndex('last_active', 'last_active', { unique: false });
                    store.createIndex('last_news', 'last_news', { unique: false });
                    store.createIndex('allow_update', 'allow_update', { unique: false });
                    store.createIndex('alert_dur', 'alert_dur', { unique: false });
                    store.createIndex('email', 'email', { unique: false });
                    store.createIndex('fullname', 'fullname', { unique: false });
                }
                if (!db.objectStoreNames.contains("News")) {
                    var store = db.createObjectStore("News", { keyPath: 'id', autoIncrement: true });

                    store.createIndex('remoteid', 'remoteid', { unique: true });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                    store.createIndex('categorystr', 'categorystr', { unique: false });
                    store.createIndex('category_slug', 'category_slug', { unique: false });
                    store.createIndex('author', 'author', { unique: false });
                    store.createIndex('date', 'date', { unique: false });
                    store.createIndex('time', 'time', { unique: false });
                    store.createIndex('image', 'image', { unique: false });
                    store.createIndex('thumb', 'thumb', { unique: false });
                    store.createIndex('excerpt', 'excerpt', { unique: false });
                    store.createIndex('url', 'url', { unique: false });
                }
                if (!db.objectStoreNames.contains("NewsCategory")) {
                    var store = db.createObjectStore("NewsCategory", { keyPath: 'id', autoIncrement: true });

                    store.createIndex('remoteid', 'remoteid', { unique: true });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('slug', 'slug', { unique: false });
                }
                if (!db.objectStoreNames.contains("Bookmarks")) {
                    var store = db.createObjectStore("Bookmarks", { keyPath: 'id', autoIncrement: true });

                    store.createIndex('remoteid', 'remoteid', { unique: true });
                    store.createIndex('title', 'title', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                    store.createIndex('categorystr', 'categorystr', { unique: false });
                    store.createIndex('category_slug', 'category_slug', { unique: false });
                    store.createIndex('author', 'author', { unique: false });
                    store.createIndex('date', 'date', { unique: false });
                    store.createIndex('time', 'time', { unique: false });
                    store.createIndex('image', 'image', { unique: false });
                    store.createIndex('thumb', 'thumb', { unique: false });
                    store.createIndex('excerpt', 'excerpt', { unique: false });
                    store.createIndex('url', 'url', { unique: false });
                }
            }
            catch (x) {
                console.log(x.message);
            }
        }

        openRequest.onsuccess = function (e) {
            console.log("Success! db created");
            db = e.target.result;

            /*call the rest of the application*/
            check_first_use();
        }

        openRequest.onerror = function (e) {
            console.log("Error");
            console.dir(e);
        }

    }
    else { alert("Sorry this application cannot run on your device"); }


}






function populateDB_delete() {

    var req = indexedDB.deleteDatabase("Newtelegraph");
    alert("Reset Complete!");
    $.ui.goBack();
    load_db();
    req.onsuccess = function () {
        alert("Reset Complete!");
        $.ui.goBack();
        load_db();
    };
    req.onerror = function () {
        alert("Reset could not be completed. Please try again");
        $.ui.goBack();
    }




}





/****************** first time use ******************************************************************************************/
/*check the database to see if its the first time the user is using the app.*/
function check_first_use() {
    var objectStore = db.transaction("Settings").objectStore("Settings");

    objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            var last_active = cursor.value.last_active;
            ALERT_DURATION = cursor.value.alert_dur;
            FONTSIZE = cursor.value.font_size;
            ALLOW_UPDATE = cursor.value.allow_update;
            ALERT_DURATION = cursor.value.alert_dur;

            console.log("last_active: " + last_active);

            if (last_active == "") {
                /*first time*/
                console.log("First Time");
                update_firstuse();
            }
            else {
                /*already used*/
                console.log("NOT First Time");
                update_lastuse();

                /*apply the saved font size*/
                $("#afui.win8").css("font-size", FONTSIZE + "em !IMPORTANT");
                console.log('font shud be ' + FONTSIZE);
                if (FONTSIZE == "0.8") { $("div.panel").css("line-height", "1.1em"); }
                if (FONTSIZE == "1") { $("div.panel").css("line-height", "1.3em"); }
                if (FONTSIZE == "1.2") { $("div.panel").css("line-height", "1.4em"); }
                if (FONTSIZE == "1.4") {
                    $("div.panel").css("line-height", "1.7em");
                    $(".top_story .caption").css("line-height", "1.3em");
                }

                var FONTSIZE_str = "1em";
                if (FONTSIZE == "0.8") { FONTSIZE_str = "0.8em !IMPORTANT"; }
                if (FONTSIZE == "1") { FONTSIZE_str = "1.2em !IMPORTANT"; }
                if (FONTSIZE == "1.2") { FONTSIZE_str = "1.4em !IMPORTANT"; }
                if (FONTSIZE == "1.4") { FONTSIZE_str = "1.6em !IMPORTANT"; }
                $("ul.newslist li .text").css("font-size", FONTSIZE_str);

            }

            /*wait 10 seconds then start the interval*/
            if (ALLOW_UPDATE == 1) {
                window.setTimeout(function () {
                    MY_INTERVAL = window.setInterval(function () { try { news.auto_load(false); } catch (x) { } }, ALERT_DURATION);
                }, 10000);
            }

            //cursor.continue();
        }
        else {
            console.log("No more entries!");
            update_firstuse();
        }
    };
}


var allow_db_access = true;
/*update the last active field so as to indicate app is no longer new*/
function update_firstuse() {
    $.ui.showMask('Loading application data. Please wait');

    allow_db_access = false;

    FONTSIZE = "1";
    ALERT_DURATION = 600000;
    ALLOW_UPDATE = 1;


    var date = new Date(),
    last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log('updating first time');

    var settings = {
        font_size: FONTSIZE,
        last_active: last_active,
        allow_update: "yes",
        alert_dur: ALERT_DURATION
    }

    var transaction = db.transaction(["Settings"], "readwrite");
    var store = transaction.objectStore("Settings");
    var request = store.add(settings, 1);

    request.onerror = function (e) {
        console.log("Error", e.target.error.name);
        alert("Installation failed. Please try again.");
        window.setTimeout(function () { $.ui.hideMask(); }, 3000);
    }

    request.onsuccess = function (e) {
        allow_db_access = true;
        load_app_content();
    }

}

function update_lastuse() {
    var date = new Date(),
        last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    console.log('updating recent time');


    var objectStore = db.transaction(["Settings"], "readwrite").objectStore("Settings");
    var request = objectStore.get(1);
    request.onerror = function (event) {
        // Handle errors!
        console.log("Error: ", event.target.error.name);
    };
    request.onsuccess = function (event) {
        // Get the old value that we want to update
        var data = request.result;
        console.log('data is ' + data.last_active);
        // update the value(s) in the object that you want to change
        data.last_active = last_active;

        // Put this updated object back into the database.
        var requestUpdate = objectStore.put(data, 1);
        requestUpdate.onerror = function (event) {
            // Do something with the error
            console.log("Update Error: ", event.target.error.name);
            load_app_content();
        };
        requestUpdate.onsuccess = function (event) {
            // Success - the data is updated!
            load_app_content();
        };
    };
}

function load_app_content() {
    /*created to allow a delay before calling the next function. if any*/
    if (allow_db_access) {

        window.setTimeout(function () { $.ui.hideMask(); }, 3000);

        newscategory.load();

        //clear any notifications of any
        //window.plugins.statusBarNotification.clear();

        //load adverts
        //advert.load_all();

        console.log('load_app_content()');
    }
}



function update_store(object_store, my_key, field_name, value) {
    var objectStore = db.transaction([object_store], "readwrite").objectStore(object_store);
    var request = objectStore.get(my_key);
    request.onerror = function (event) {
        // Handle errors!
        console.log("Error: ", event.target.error.name);
    };
    request.onsuccess = function (event) {
        // Get the old value that we want to update
        var data = request.result;
        console.log('data is ' + data[field_name]);
        // update the value(s) in the object that you want to change
        data[field_name] = value;

        // Put this updated object back into the database.
        var requestUpdate = objectStore.put(data, my_key);
        requestUpdate.onerror = function (event) {
            // Do something with the error
            console.log("Update Error: ", event.target.error.name);
        };
        requestUpdate.onsuccess = function (event) {
            // Success - the data is updated!
        };
    };
}


/*generic db functions*/
function execute_sql(sql) {
    if (sql) {
        db.transaction(function (tx) {
            tx.executeSql(sql, []);
            return true;
        }, errorCB);
    }
}

function getFromForValue(get, from, forx, value) {
    sql = "SELECT " + get + " FROM " + from + " WHERE " + forx + " = '" + value + "' LIMIT 1";
    if (sql) {
        db.transaction(function (tx) {
            tx.executeSql(sql, [], function (tx, results) {
                if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                        return results.rows.item(i)[0];
                        break;
                    }
                }

            }, errorCB);
        }, errorCB);
    }
}




function duplicate(array, id) {
    /*checks for duplicates in an array*/
    for (var i = 0; i < array.length; i++) {
        if (array[i][0] == id) {
            return true;
        }
    }
    return false;
}

function plain_duplicate(array, id) {
    /*checks for duplicates in an array*/
    for (var i = 0; i < array.length; i++) {
        if (array[i] == id) {
            return true;
        }
    }
    return false;
}






/***********************************************************************************************/
/***
use the object below to manage news category, add/update/refresh
***/
/***********************************************************************************************/




/*onlypick the main ones from the array below*/
var category_arr = ["Home", "News", "Politics", "Business", "Sports", "Columnists", "Editorial", "Arts", "Entertainment", "Metro"];

var newscategory = {
    load: function () {
        try {
            var count = 0, title = catstr_lc = list = list_more = remoteid = "";

            var objectStore = db.transaction("NewsCategory").objectStore("NewsCategory");

            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {

                    /*get all the details*/

                    remoteid = cursor.value.remoteid;
                    title = cursor.value.title;
                    catstr_lc = cursor.value.slug;

                    /*
                    catstr_lc = title.toLowerCase();
                    catstr_lc = catstr_lc.replace(/'/g, "&acute;");*/

                    if (plain_duplicate(category_arr, title)) {
                        list += "<li id='cat_" + remoteid + "' onclick=\"$.ui.loadContent('#main',false,false,'none'); $.ui.scrollToTop('main',500); news.sort_items('" + catstr_lc + "', '" + remoteid + "', '" + title.replace(/'/g, "&acute;") + "')\">" + title + "</li>";
                    }
                    else {
                        list_more += "<li id='cat_" + remoteid + "' onclick=\"$.ui.loadContent('#main',false,false,'none'); $.ui.scrollToTop('main',500); news.sort_items('" + catstr_lc + "', '" + remoteid + "', '" + title.replace(/'/g, "&acute;") + "')\">" + title + "</li>";
                    }

                    count += 1;
                    //console.log('count is '+count);
                    cursor.continue();
                }
                else {
                    if (count > 0) {
                        $("#newscategory_list").html("<li onclick=\"$.ui.loadContent('#main',false,false,'none'); news.sort_items('all','')\">All</li>" + list + "<li onclick=\"showHide('btn_more_cat','newscategory_list_more')\" id='btn_more_cat'>More</li>");
                        $("#newscategory_list_more").html("<li class='divider'>Other Categories</li>" + list_more);

                        /*load news*/
                        $("#cat_refresh").show();
                        news.load();
                    }
                    else {
                        /*load from online*/
                        console.log("No categories. going online!");
                        if (checkConnection()) {
                            newscategory.fetch();
                        }
                        else {
                            alert("No Internet connection available");
                            $("#news_list").html("<li>No Internet connection available</li>");
                        }

                    }
                }
            };


        }
        catch (x) {
            console.log(x.message);
        }

    },

    fetch: function () {

        //var url = URL+'&action=get_items&type=News_Category&timestamp='+(new Date()).getTime();
        var url = URL + '?json=get_category_index&exclude=description';
        console.log('going to ' + url);

        $("#newscategory_list").html("<li>Loading..</li>");
        $("#news_list").html(" ");



        newsrequest = $.ajax({
            url: url,
            success: function (data) {
                var count = 0, title = catstr_lc = list = list_more = remoteid = "";

                try {
                    var obj = JSON.parse(data);

                    for (var i = 0; i < obj.categories.length; i++) {
                        var entry = obj.categories[i];

                        /*we only want top categories
                            Home   News    Politics    Business    Sports    Columnists    Editorial   Arts		Entertainment	Metro
                        */

                        if (entry.id && entry.slug) {
                            title = entry.title;
                            if (plain_duplicate(category_arr, title)) {
                                /*if its in the list we want, save to main list*/
                                list += "<li id='cat_" + entry.id + "' onclick=\"$.ui.loadContent('#main',false,false,'none'); $.ui.scrollToTop('main',500); news.sort_items('" + entry.slug.toLowerCase() + "','" + entry.id + "', '" + title.replace(/'/g, "&acute;") + "')\">" + title + "</li>";
                            }
                            else {
                                list_more += "<li id='cat_" + entry.id + "' onclick=\"$.ui.loadContent('#main',false,false,'none'); $.ui.scrollToTop('main',500); news.sort_items('" + entry.slug.toLowerCase() + "','" + entry.id + "', '" + title.replace(/'/g, "&acute;") + "')\">" + title + "</li>";
                            }

                            newscategory.store(entry.id, title, entry.slug.toLowerCase());

                        }

                        count += 1;
                    }
                } catch (x) { console.log(x.message); }

                if (count == 0) {
                    alert(LOAD_FAILED_MSG);
                    $("#news_list").html("<li>" + LOAD_FAILED_MSG + "</li>");
                    $("#newscategory_list").html("<li>" + LOAD_FAILED_MSG + "</li>");
                }
                else {
                    $("#newscategory_list").html("<li onclick=\"$.ui.loadContent('#main',false,false,'none'); news.sort_items('all','')\">All</li>" + list + "<li onclick=\"showHide('btn_more_cat','newscategory_list_more')\" id='btn_more_cat'>More</li>");
                    $("#newscategory_list_more").html("<li class='divider'>Other Categories</li>" + list_more);
                    /*load news*/
                    $("#cat_refresh").show();
                    news.load();
                }

                /*hide the loader*/
                $.ui.hideMask();

            }, timeout: "20000",
            error: function (xhr) {
                //console.log("ERROR FETCHING NEWS "+xhr.message+" Err: "+xhr.message+" code: "+xhr.code);
                $("#news_list").html("<li>" + SERVER_UNREACHABLE + "</li>");
                $("#newscategory_list").html("<li>" + SERVER_UNREACHABLE + "</li>");
                alert("News error: " + SERVER_UNREACHABLE);
                $.ui.hideMask();
            }

        });

    },

    refresh_list: function () {
        if (confirm("Are you sure you want to refresh this list?")) {
            if (checkConnection) {
                $.ui.showMask("Refreshing");

                try {
                    var objectStore = db.transaction("NewsCategory", "readwrite").objectStore("NewsCategory");
                    objectStore.openCursor().onsuccess = function (event) {
                        var cursor = event.target.result;
                        if (cursor) {
                            var id = cursor.value.id;
                            objectStore.delete(id);
                            cursor.continue();
                        }
                        else {
                            newscategory.load();
                        }
                    };


                }
                catch (x) {
                    console.log(x.message);
                }
            }
            else {
                alert(LOAD_FAILED_MSG);
            }
        }
    },

    /*saves item*/
    store: function (remoteid, title, slug) {

        var item = {
            remoteid: remoteid,
            title: title,
            slug: slug
        }

        var transaction = db.transaction(["NewsCategory"], "readwrite");
        var store = transaction.objectStore("NewsCategory");
        var request = store.add(item);

        request.onerror = function (e) {
            console.log("Category save Error", e.target.error.name);
        }

        request.onsuccess = function (e) {
        }

    }
};









var news = {
    start_id: '', /*hold value of first and last displayed items. so on refresh or load more can pull accordingly*/
    stop_id: '',
    current_category: '',
    current_id: 0,
    is_first_time: false,
    items_arr: new Array(),
    current_item_arr: new Array(),
    load: function () {
        try {
            var count = 0, remoteid = smallimg = largeimg = image = url = list = list_topstory = categorystr = category_slug = intro = date = time = details = excerpt = instruction = author = "";

            var objectStore = db.transaction("News").objectStore("News");

            //objectStore.openCursor(null, "prevunique").onsuccess = function (event) {
            objectStore.index('remoteid').openCursor(null, "prevunique").onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {

                    /*get all the details*/


                    remoteid = cursor.value.remoteid;
                    details = cursor.value.details;
                    excerpt = cursor.value.excerpt;
                    title = cursor.value.title;
                    categorystr = cursor.value.categorystr;
                    datestr = date = cursor.value.date;
                    author = cursor.value.author;
                    category_slug = cursor.value.category_slug;


                    intro = strip_tags(excerpt).substr(0, 100);

                    smallimg = cursor.value.thumb;
                    largeimg = cursor.value.image;
                    image = "";

                    instruction = "onclick=\"news.load_content(" + remoteid + ");$.ui.loadContent('#news_item',false,false,'none');\"";

                    navitem = { id: remoteid, title: title, catstr: categorystr, author: author, catstr_lc: category_slug, intro: intro, date: datestr, img: smallimg, large_img: largeimg, instruction: instruction };

                    if (count == 0) {
                        list_topstory += $.template("tpl_top_story", { navitem: navitem });
                    }
                    else {
                        list += $.template("tpl_items_list", { navitem: navitem });
                    }


                    if (!duplicate(news.items_arr, remoteid)) {
                        var arr = [remoteid, title];
                        news.items_arr.push(arr);
                    }

                    count += 1;
                    cursor.continue();
                }
                else {
                    if (count > 0) {
                        $.ui.hideMask();
                        $("#news_list").html(list);
                        if (list_topstory != "") { $("#news_list_topstory").html(list_topstory); }
                        is_news_loaded = true;
                        hide_broken_images(true);

                        $("#load_more_ul").show();
                    }
                    else {
                        /*load from online*/
                        news.is_first_time = true;

                        news.fetch("");
                    }
                }
            };


        }
        catch (x) {
            console.log(x.message);
        }
    },

    fetch: function (fetch_mode) {

        //var url = URL+'&action=get_items&type=News&timestamp='+(new Date()).getTime()+'&category='+news.current_category;
        var url = URL + "?json=get_recent_posts&page=" + CURRENT_PAGE + "&count=" + FETCH_LIMIT + "&include=id,title,thumbnail,url,date,excerpt,content,categories,status,author";


        if (fetch_mode == "") { $("#news_list").html("<li>Loading..</li>"); $("#load_more_ul").hide(); }
        var progress_div = "<li id='progress_div'>Loading..</li>";

        if (fetch_mode == "old") {
            /*$("#news_list").append(progress_div);*/
            CURRENT_PAGE = CURRENT_PAGE + 1;
            url = URL + "?json=get_recent_posts&page=" + CURRENT_PAGE + "&count=" + FETCH_LIMIT + "&include=id,title,thumbnail,url,date,excerpt,content,categories,status,author";
            $("#load_more_link").html("Loading..");
        }
        if (fetch_mode == "new") {
            $.ui.showMask('Refreshing..');
            CURRENT_PAGE = 1;
            $("#news_list").prepend(progress_div);
            url = URL + "?json=get_recent_posts&page=" + CURRENT_PAGE + "&count=" + FETCH_LIMIT + "&include=id,title,thumbnail,url,date,excerpt,content,categories,status,author";
        }

        if (news.current_category > 0) {
            url = URL + "?json=get_category_posts&page=" + CURRENT_PAGE + "&count=" + FETCH_LIMIT + "&include=id,title,thumbnail,url,date,excerpt,content,categories,status,author&order_by=date&order=DESC&id=" + news.current_category;
        }

        console.log("GOING TO " + url);

        newsrequest = $.ajax({
            url: url,
            success: function (data) {

                var list = list_topstory = intro = author = "", smallimg = "", largeimg = "", image = catstr = catstr_lc = item_url = "", count = category = 0;

                try {
                    var obj = JSON.parse(data);

                    //console.log(data);

                    for (var i = 0; i < obj.posts.length; i++) {
                        var entry = obj.posts[i];

                        if (entry.id && entry.title && entry.status == "publish") {

                            if (!duplicate(news.items_arr, entry.id)) {
                                date = entry.date;
                                datestr = new Date(date.replace(/-/g, "/")).toDateString() + " " + new Date(date.replace(/-/g, "/")).toLocaleTimeString();

                                smallimg = ""; largeimg = ""; image = "";
                                if (entry.thumbnail) {
                                    smallimg = entry.thumbnail;
                                    largeimg = entry.thumbnail_images.full.url;

                                    /*flag*/
                                    img_preload = new Image();
                                    img_preload.src = smallimg;
                                    img_preload = new Image();
                                    img_preload.src = largeimg;

                                }

                                image = largeimg;

                                if (entry.author) {
                                    author = entry.author.name;
                                }

                                catstr = entry.categories[0].title;
                                category = entry.categories[0].id;
                                catstr_lc = entry.categories[0].slug.toLowerCase();


                                item_url = entry.url;

                                if (fetch_mode != "old") {
                                    news.store(entry.id, entry.title, category, catstr, catstr_lc, datestr, entry.content, image, author, smallimg, entry.excerpt, item_url);
                                }


                                intro = strip_tags(entry.excerpt).substr(0, 100);

                                instruction = "onclick=\"news.load_content(" + entry.id + "); $.ui.loadContent('#news_item',false,false,'none');\"";
                                navitem = { id: entry.id, title: entry.title, author: author, catstr: catstr, catstr_lc: catstr_lc, intro: intro, date: datestr, img: smallimg, large_img: largeimg, instruction: instruction };
                                /*always display top stories in gallery mode at top*/
                                if (count == 0 && fetch_mode != "old" && entry.thumbnail) {
                                    list_topstory += $.template("tpl_top_story", { navitem: navitem });
                                }
                                else {
                                    list += $.template("tpl_items_list", { navitem: navitem });
                                }

                                var arr = [entry.id, entry.title];
                                news.items_arr.push(arr);

                                count += 1;
                            }
                        }
                    }
                } catch (x) { console.log(x.message); }

                if (count == 0) {

                    if (fetch_mode == "") {
                        alert(LOAD_FAILED_MSG);
                        $("#news_list").html("<li>" + LOAD_FAILED_MSG + "</li>");
                        $("#load_more_ul").hide();
                    }
                    if (fetch_mode == "old") {
                        $("#load_more_link").html("Reached end of the list");
                        setTimeout(function () { $("#load_more_ul").hide(); }, 3000);
                    }
                    if (fetch_mode == "new") {
                        $("#progress_div").html("Reached top of the list");
                        setTimeout(function () { $("#progress_div").remove(); }, 3000);
                    }

                }
                else {
                    /*push respective strings*/
                    if (fetch_mode == "old") {
                        $("#news_list").append(list);
                        $("#load_more_link").html("Load more");
                        allow_load_more_news = true;
                    }
                    else if (fetch_mode == "new") {
                        if (news.is_first_time) {
                            $("#news_list").html(list);
                            if (list_topstory != "") { $("#news_list_topstory").html(list_topstory); }
                        }
                        else {
                            $("#news_list").prepend(list);
                            if (list_topstory != "") { $("#news_list_topstory").html(list_topstory); }
                            setTimeout(function () { $("#progress_div").remove(); }, 3000);

                            /*in this case clear the News*/
                            news.clear_table(count);
                        }
                    }
                    else {
                        $("#news_list").html(list);
                        if (list_topstory != "") { $("#news_list_topstory").html(list_topstory); }
                        is_news_loaded = true;
                        $("#load_more_ul").show();
                    }
                }

                /*hide the loader and bad images*/
                $.ui.hideMask();
                hide_broken_images(true);

            }, timeout: "20000",
            error: function (xhr) {
                if (fetch_mode != "old") {
                    alert(SERVER_UNREACHABLE);
                }
                else { $("#load_more_link").html(SERVER_UNREACHABLE); setTimeout(function () { allow_load_more_news = true; $("#load_more_link").html("Load more"); }, 5000); }
                try { setTimeout(function () { $("#progress_div").remove(); }, 3000); } catch (x) { }
                $.ui.hideMask();
                //console.log("ERROR FETCHING NEWS "+xhr.message+" Err: "+xhr.message+" code: "+xhr.code);
            }
        });
    },



    auto_load: function () {

        //console.log("auto searching for news items now");
        var url = URL + "?json=get_recent_posts&page=1&count=5&include=id,title,thumbnail,url,date,excerpt,content,categories,status,author";

        autorequest = $.ajax({
            url: url,
            success: function (data) {

                var list = list_topstory = intro = author = "", smallimg = "", largeimg = "", image = catstr = catstr_lc = item_url = last_alrt_text = "", count = category = 0;

                try {
                    var obj = JSON.parse(data);

                    /*console.log(data);*/

                    for (var i = 0; i < obj.posts.length; i++) {
                        var entry = obj.posts[i];

                        if (entry.id && entry.title && entry.status == "publish") {
                            if (!duplicate(news.items_arr, entry.id)) {
                                last_alrt_text = entry.title;

                                date = entry.date;
                                datestr = new Date(date.replace(/-/g, "/")).toDateString() + " " + new Date(date.replace(/-/g, "/")).toLocaleTimeString();

                                smallimg = ""; largeimg = ""; image = "";
                                if (entry.thumbnail) {
                                    smallimg = entry.thumbnail;
                                    largeimg = entry.thumbnail_images.full.url;

                                    /*flag*/
                                    img_preload = new Image();
                                    img_preload.src = smallimg;
                                    img_preload = new Image();
                                    img_preload.src = largeimg;
                                }

                                image = largeimg;

                                if (entry.author) {
                                    author = entry.author.name;
                                }

                                catstr = entry.categories[0].title;
                                category = entry.categories[0].id;
                                catstr_lc = entry.categories[0].slug.toLowerCase();


                                item_url = entry.url;

                                news.store(entry.id, entry.title, category, catstr, catstr_lc, datestr, entry.content, image, author, smallimg, entry.excerpt, item_url);



                                intro = strip_tags(entry.excerpt).substr(0, 100);

                                instruction = "onclick=\"news.load_content(" + entry.id + "); $.ui.loadContent('#news_item',false,false,'none');\"";
                                navitem = { id: entry.id, title: entry.title, author: author, catstr: catstr, catstr_lc: catstr_lc, intro: intro, date: datestr, img: smallimg, large_img: largeimg, instruction: instruction };
                                /*always display top stories in gallery mode at top*/
                                if (count == 0 && entry.thumbnail) {
                                    list_topstory += $.template("tpl_top_story", { navitem: navitem });
                                }
                                else {
                                    list += $.template("tpl_items_list", { navitem: navitem });
                                }

                                var arr = [entry.id, entry.title];
                                news.items_arr.push(arr);

                                count += 1;
                            }
                        }
                    }
                } catch (x) { console.log(x.message); }

                if (count == 0) {

                }
                else {
                    news.clear_table(count);

                    if (list_topstory != "") { $("#news_list_topstory").html(list_topstory); }
                    $("#news_list").prepend(list);
                    /*create a notification*/
                    try { if (allow_sound == "yes") { playAudio(); } if (allow_vibrate) { shake_phone(); } } catch (x) { }


                }
                hide_broken_images(true);

            }, timeout: "20000",
            error: function (xhr) {
            }
        });
    },


    /*sorts a list based on class*/
    sort_items: function (myclass, category, category_title) {
        /*set the category such that if the item fetches it category specific*/
        news.current_category = category;

        var nonefound = document.createElement('li');
        nonefound.id = "none_found";

        if (myclass == "all") {
            /*show everything when user clicks all. set current category to zero. remove indicating classes*/

            news.current_category = 0;

            $('#news_list li').show();
            $("#none_found").remove();
            $("#news_title").html('');

            $("#newscategory_list li").removeClass("current");
            $("#load_more_ul").show();
            $("#news_list_topstory").show();

        }
        else {
            /*change class to current for clicked item and hide elements that dont belong */


            $("#news_list_topstory").hide();


            $("#newscategory_list li").removeClass("current");
            $("#cat_" + category).addClass("current");

            $("#news_title").html("<div>" + category_title + "</div>");
            $('#news_list li').hide();
            console.log('#news_list li.' + myclass);
            $('#news_list li.' + myclass).show();
            $("#none_found").remove();

            var count = $('#news_list li.' + myclass).length;
            if (count < 1) {
                nonefound.innerHTML = "There are no articles for the <strong>" + category_title + "</strong> category  at the moment.";
                $('#news_list').append(nonefound);
                $("#load_more_ul").hide();
            }
            else {
                $("#none_found").remove();
                $("#load_more_ul").show();
            }
        }
    },

    /*saves item*/
    store: function (remoteid, title, category, categorystr, catstr_lc, datecreated, details, image, author, thumb, excerpt, item_url) {

        var item = {
            remoteid: remoteid,
            title: title,
            category: category,
            categorystr: categorystr,
            category_slug: catstr_lc,
            date: datecreated,
            details: details,
            image: image,
            author: author,
            thumb: thumb,
            excerpt: excerpt,
            url: item_url
        }

        var transaction = db.transaction(["News"], "readwrite");
        var store = transaction.objectStore("News");
        var request = store.add(item);

        request.onerror = function (e) {
            console.log("News save Error", e.target.error.name);
        }

        request.onsuccess = function (e) {
        }
    },


    /*loads an item	*/
    load_content: function (id, table) {

        /*first check if we have it in the database*/
        if (parseInt(id) > 0) {
            $("#main_news_body").html("<h3 class='pad'>Loading</h3>");
            news.current_id = id;


            var transaction = db.transaction(["News"], "readonly");
            var store = transaction.objectStore("News");

            if (table == "Bookmarks") {
                transaction = db.transaction(["Bookmarks"], "readonly");
                store = transaction.objectStore("Bookmarks");
                console.log('will fetch from bookmarks instead');
            }


            var index = store.index("remoteid");
            var request = index.get(id);



            request.onerror = function (event) {
                /*nothing was found in the database thus we have to load the entire item*/
                $.ui.showMask('loading');
                $("#main_news_body").html("");
                news.fetch_details(id);
            };

            request.onsuccess = function (event) {
                // Do something with the request.result!
                console.log();

                var r = request.result;
                if (r && r != undefined) {

                    /*fetch all the details*/
                    var remoteid = r.remoteid;
                    console.log('remoteid is ' + remoteid);
                    CURRENT_ITEM_TITLE = r.title;
                    CURRENT_ITEM_ID = remoteid;

                    var largeimg = r.image;
                    var datestr = date = r.date;




                    navitem = {
                        id: r.remoteid,
                        title: r.title,
                        catstr: r.categorystr,
                        date: datestr,
                        details: r.details,
                        author: r.author,
                        large_img: largeimg
                    };

                    /*save current item in array. this makes it easy to access when the user bookmarks to database*/


                    var arr = [r.remoteid, r.title, r.category, r.categorystr, r.category_slug, r.details, r.image, r.thumb, r.author, r.date, r.excerpt, r.url];
                    news.current_item_arr[0] = arr;

                    var page_content = $.template("tpl_item_body", { navitem: navitem });

                    var comment_bar = "<div class='pad'><a class='full_width button red' onClick=\"$.ui.loadContent('#comments',false,false,'none');\">comments</a></div>";
                    $("#main_news_body").html(page_content + comment_bar);
                    var FONTSIZE_str = "1em";
                    if (FONTSIZE == "0.8") { FONTSIZE_str = "0.8em"; }
                    if (FONTSIZE == "1") { FONTSIZE_str = "1.2em"; }
                    if (FONTSIZE == "1.2") { FONTSIZE_str = "1.4em"; }
                    if (FONTSIZE == "1.4") { FONTSIZE_str = "1.6em"; }

                    $("#main_news_body div.content #item_story p").css("font-size", FONTSIZE + "em");
                    $("#main_news_body div.content #item_story p").css("line-height", FONTSIZE_str );


                    /*set the share text*/
                    share_title = r.title + " - " + "New Telegraph Newspaper";
                    share_text = "<a href=\"" + r.url + "\">read full story at " + r.url + "</a>";


                    /*if we are here means the info was saved*/

                    if (r.title == "") {
                        /*go online to fetch the data*/
                        $.ui.showMask('loading');
                        $("#main_news_body").html("");
                        news.fetch_details(id);
                    }
                    else {
                        /*load the buttons: next, previous, share, comment, save*/
                        news.check_navigation(id);
                        news.get_comment_count(id);
                        news.get_similar(id, r.category);


                        /*wordpress returns large pieces of text with a read more link when calling get_posts. 
                        Its saved as such in the dbase. so on reading or item view we detect if theres an item 
                        with a read more link and then go online and fetch the full details instead*/

                        var detect_link = 'class="more-link">Read more</a>';
                        if (r.details.indexOf(detect_link) !== -1) {
                            //the link is found go online and retrieve the details
                            if (checkConnection()) {
                                news.get_story(id);
                            }
                            else {
                                //just make the link load the browser if theres no network/
                                news.externalize_links();
                            }
                        }
                        else {
                            //no read more link, content is ok, still find other links and make them open in the device browser
                            //call this function to turn all embeded links to open in browser
                            news.externalize_links();
                        }
                    }
                }
                else {
                    /*go online to fetch the data*/
                    $.ui.showMask('loading');
                    $("#main_news_body").html("");
                    news.fetch_details(id);
                }
            };

        }
    },


    /*if an item's details is not found in the database, check online*/
    fetch_details: function (id) {
        if (parseInt(id) > 0) {
            var url = URL + '?json=get_post&id=' + id;
            console.log('going to fetch at ' + url);
            newsrequest = $.ajax({
                url: url,
                success: function (data) {
                    try {
                        var obj = JSON.parse(data);
                        var obj_length = obj.length;
                        var count = 0;

                        //for(var i=0; i<obj.post.length; i++)
                        //{
                        var entry = obj.post;


                        var title = entry.title;
                        CURRENT_ITEM_ID = entry.id;
                        /*set the share text*/
                        share_title = title + " - " + "New Telegraph Newspaper";
                        share_text = "<a href=\"" + entry.url + "\">read full story at " + entry.url + "</a>";

                        CURRENT_ITEM_TITLE = title;

                        var smallimg = largeimg = image = "";

                        if (entry.thumbnail) {
                            smallimg = entry.thumbnail;
                            largeimg = entry.thumbnail_images.full.url;
                        }

                        var date = entry.date;
                        var datestr = new Date(date.replace(/-/g, "/")).toDateString() + " " + new Date(date.replace(/-/g, "/")).toLocaleTimeString();

                        var catstr = entry.categories[0].title;
                        var cat_slug = entry.categories[0].slug.toLowerCase();

                        var author = "";
                        if (entry.author) {
                            author = entry.author.name;
                        }
                        navitem = {
                            id: entry.itemid,
                            title: title,
                            catstr: catstr,
                            date: datestr,
                            details: entry.content,
                            author: author,
                            large_img: largeimg
                        };

                        var page_content = $.template("tpl_item_body", { navitem: navitem });

                        var comment_bar = "<div class='pad'><a class='full_width button red' onClick=\"$.ui.loadContent('#comments',false,false,'none');\">comments</a></div>";

                        $("#main_news_body").html(page_content + comment_bar);
                        var FONTSIZE_str = "1em";
                        if (FONTSIZE == "0.8") { FONTSIZE_str = "0.8em"; }
                        if (FONTSIZE == "1") { FONTSIZE_str = "1.2em"; }
                        if (FONTSIZE == "1.2") { FONTSIZE_str = "1.4em"; }
                        if (FONTSIZE == "1.4") { FONTSIZE_str = "1.6em"; }

                        $("#main_news_body div.content #item_story p").css("font-size", FONTSIZE + "em");
                        $("#main_news_body div.content #item_story p").css("line-height", FONTSIZE_str);

                        /*show comment count*/
                        $("#view_total_comments").html(entry.comment_count);
                        $("#display_comment_count").html(entry.comment_count);



                        /*save current item in array remoteid,title,category,details,image,thumb,author,date */


                        var arr = [entry.id, entry.title, entry.category, catstr, cat_slug, entry.content, largeimg, smallimg, entry.author.name, datestr, entry.excerpt];
                        news.current_item_arr[0] = arr;


                        if (title == "") {
                            $('#main_news_body').html("<h3 class='pad'>Sorry. Item not found. Please contact support if problem persists.</h3>");
                        }
                        else {
                            /*buttons. next, previous, share, comment, save*/
                            news.check_navigation(id);

                            /*display similar news stories*/
                            news.get_similar(entry.id, entry.category);

                            /*call this function to turn all embeded links to open in browser*/
                            news.externalize_links();
                        }

                        count += 1;
                        //}/*close var*/


                        if (count == 0) {
                            /*first check if theres already data on the form*/
                            $('#main_news_body').html("<h3 class='pad'>Story not found. Please try again later.</h3>");
                        }

                        $.ui.hideMask();

                    } catch (x) {/*console.log(x.message);*/ }



                }, timeout: "15000",
                error: function (xhr) {

                    $('#main_news_body').html("<h3 class='pad'>Seems you are offline. Please try again later.</h3>");
                    //console.log("ERROR FETCHING Details "+xhr.message+" Err: "+xhr.message+" code: "+xhr.code);
                }
            });
        }
    },


    get_story: function (id) {
        if (parseInt(id) > 0) {
            $("#item_story").html("<h3 class='pad align_center'>Loading content. Please wait...</h3>");
            var url = URL + '?json=get_post&include=content&id=' + id;

            detailsrequest = $.ajax({
                url: url,
                success: function (data) {
                    try {
                        var obj = JSON.parse(data);

                        var entry = obj.post;

                        if (entry.content) {
                            $('#item_story').html(entry.content);
                            var FONTSIZE_str = "1em";
                            if (FONTSIZE == "0.8") { FONTSIZE_str = "0.8em"; }
                            if (FONTSIZE == "1") { FONTSIZE_str = "1.2em"; }
                            if (FONTSIZE == "1.2") { FONTSIZE_str = "1.4em"; }
                            if (FONTSIZE == "1.4") { FONTSIZE_str = "1.6em"; }

                            $("#main_news_body div.content #item_story p").css("font-size", FONTSIZE + "em");
                            $("#main_news_body div.content #item_story p").css("line-height", FONTSIZE_str + "em");

                            /*also update dbase for next time*/
                            console.log('updating item table:' + id);

                            update_store("News", id, "details", entry.content);

                            /*also update the array used for bookmarking*/
                            news.current_item_arr[0][5] = entry.content;

                            /*call this function to turn all embeded links to open in browser*/
                            news.externalize_links();
                        }
                        else {
                            $('#item_story').html("<h3 class='pad'>Connection seems to be taking a while. Please try again later.</h3>");
                        }

                    } catch (x) { }
                }, timeout: "15000",
                error: function (xhr) {
                    $('#item_story').html("<h3 class='pad'>Seems you are offline. Please try again later.</h3>");
                }
            });
        }
    },


    externalize_links: function () {
        /*also run a function to check the details field for any links. replace wthe link with one that calls outside the app*/
        $('#item_story a').each(function () {
            var my_text = this.text;
            var my_location = this.href;
            this.href = "#news_item";
            $(this).bind("click", function (event) { loadURL(my_location); });
        });
    },


    get_similar: function (id, category) {

        if (id > 0 && category > 0) {
            var details = "";
            $("#similar_stories").html("");
            try {
                var count = 0;
                var objectStore = db.transaction("News").objectStore("News");

                objectStore.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        var remoteid = cursor.value.remoteid;
                        var thumb = cursor.value.thumb;
                        var title = cursor.value.title;
                        var this_category = cursor.value.category;
                        if (this_category == category && id != remoteid && count < 3) {
                            details += "<div class='story' onClick=\"news.load_content(" + cursor.value.remoteid + "); $.ui.scrollToTop('news_item',500);\"><div class='img'><img src='" + cursor.value.thumb + "'/></div><div class='text'>" + cursor.value.title + "</div><div class='clear'></div></div>";
                            count += 1;
                        }

                        cursor.continue();

                    }
                    else {
                        if (count > 0) {
                            details = "<h3>Similar articles</h3><div class='clear'></div>" + details + "<div class='clear'></div>";
                            $("#similar_stories").html(details);
                            hide_broken_images(true);
                        }
                    }
                };


            }
            catch (x) {
                console.log(x.message);
            }
        }

    },


    get_comment_count: function (id) {
        if (parseInt(id) > 0) {
            $("#view_total_comments").html("...");
            var url = URL + '?json=get_post&include=comment_count&id=' + id;
            //console.log(url);
            count_request = $.ajax({
                url: url,
                success: function (data) {
                    try {
                        var obj = JSON.parse(data);
                        var comment_count = obj.post.comment_count;
                        $("#view_total_comments").html(comment_count);
                        $("#display_comment_count").html(comment_count);

                    } catch (x) { $("#view_total_comments").html("!"); }
                }, timeout: "15000",
                error: function (xhr) {
                    $("#view_total_comments").html("!");
                }
            });
        }
    },

    check_navigation: function (id) {

        /*given an id, see if the user can navigate next or back*/
        for (var x = 0; x < news.items_arr.length; x++) {
            if (id == news.items_arr[x][0]) {
                /*check if theres anything in the next posn
                never exceed the last row*/
                var y = x + 1;

                try {

                    $("#news_item").unbind("swipeLeft");
                    $("#news_item").unbind("swipeRight");

                    if (news.items_arr[y][0]) {
                        /*bind swipe actions*/
                        $("#news_item").bind("swipeLeft", function () { news.load_content(news.items_arr[y][0]); $.ui.scrollToTop('news_item', 1500); })
                    }
                } catch (x) { }

                /*previous item*/
                var z = x - 1;


                try {
                    if (news.items_arr[z][0]) {
                        /*bind swipe actions*/
                        $("#news_item").bind("swipeRight", function () { news.load_content(news.items_arr[z][0]); $.ui.scrollToTop('news_item', 1500); })
                    }
                } catch (x) { }
                break;
            }
        }


        /*also check of the save button can be enabled*/
        console.log('checking if saved');
        var transaction = db.transaction(["Bookmarks"], "readonly");
        var store = transaction.objectStore("Bookmarks");
        var index = store.index("remoteid");
        var request = index.get(id);


        request.onerror = function (event) {
            console.log("Bookmarks item save Error", event.target.error.name);
            $('#news_save_button').html("<div onclick=\"news.save_current()\">Add to Bookmarks</div>");
        };

        request.onsuccess = function (event) {
            if (request.result) {

                var r = request.result;

                //console.log('result is ' + r);
                var remoteid = r.remoteid;

                if (remoteid > 0) {
                    $('#news_save_button').html("<div onclick=\"saved_news.delete_item(" + id + ")\">Remove from Bookmarks</div>");
                }
                else {
                    //console.log('we dont have remoteid');
                    $('#news_save_button').html("<div onclick=\"news.save_current()\">Add to Bookmarks</div>");
                }
            }
            else {
                //console.log('we dont have r');
                $('#news_save_button').html("<div onclick=\"news.save_current()\">Add to Bookmarks</div>");
            }
        }


        /*hide images not loaded*/
        hide_broken_images();

    },


    save_current: function () {
        /*this saves the current item in the bookmark table*/
        try {
            if (news.current_item_arr[0][0]) {
                var time_saved = new Date().toDateString() + " " + new Date().toLocaleTimeString();

                var item = {
                    remoteid: news.current_item_arr[0][0],
                    title: news.current_item_arr[0][1],
                    category: news.current_item_arr[0][2],
                    categorystr: news.current_item_arr[0][3],
                    category_slug: news.current_item_arr[0][4],
                    details: news.current_item_arr[0][5],
                    image: news.current_item_arr[0][6],
                    thumb: news.current_item_arr[0][7],
                    author: news.current_item_arr[0][8],
                    date: time_saved,
                    excerpt: news.current_item_arr[0][10],
                    url: news.current_item_arr[0][11]
                }

                var transaction = db.transaction(["Bookmarks"], "readwrite");
                var store = transaction.objectStore("Bookmarks");
                var request = store.add(item);

                request.onerror = function (e) {
                    console.log("Bookmarks item save Error", e.target.error.name);
                    $('#news_save_button').html(" ");
                    alert('Error encountered while saving. Please try again.');
                }

                request.onsuccess = function (e) {
                    news.item_saved();
                    console.log('saved');
                }
            }
        }
        catch (x) { }
    },

    item_saved: function () { $('#news_save_button').html("<div onclick=\"saved_news.delete_item(" + CURRENT_ITEM_ID + ")\">Remove from Bookmarks</div>"); },

    /*deletes certain number of items from the news db. Such that there is a maximum number of stored news*/
    clear_table: function (clear_amt) {
        /*this clears the news News of a certain number of elements from the bottom*/
        if (parseInt(clear_amt) > 0) {
            /*limit is having an issue so we would just roll thru array and delete one by one. smh*/
            console.log('****************** will  try delete items ' + clear_amt);

            try {
                var count = del_count = 0;
                var objectStore = db.transaction("News", "readwrite").objectStore("News");
                //var indexRange = IDBKeyRange.upperBound(39,true); to get 39 and below
                //objectStore.openCursor(null, "prevunique").onsuccess = function (event) {			        
                objectStore.index('remoteid').openCursor(null, "prevunique").onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        /*only delete items if there are more than 30 in News*/
                        if (count > 29) {
                            var id = cursor.value.id;
                            console.log('we will delete ' + id);
                            //if the number to be deleted is not yet reached
                            if (del_count < clear_amt) {
                                //delete items before the last id
                                objectStore.delete(id);
                                del_count += 1;
                            }
                        }
                        console.log('del count is now ' + count);
                        count += 1;
                        cursor.continue();
                    }
                    else {
                    }
                };
            }
            catch (x) {
                console.log(x.message);
            }
        }
    },

    curr_search_page: 1,
    search_text: "",
    searchnews: function (text) {

        if (text) { news.search_text = text } else { text = news.search_text; }

        if (news.curr_search_page == 1) {
            $.ui.showMask('Searching..');
        }
        else {
            $("#load_more_search_link").html("<img src='img/loading.gif' align='absmiddle'/> Loading..");
        }


        var url = URL + "?json=get_search_results&search=" + text + "&page=" + news.curr_search_page + "&count=" + 15 + "&include=id,title,thumbnail,date,excerpt,content,categories,status,author";


        console.log("search at " + url);

        searchrequest = $.ajax({
            url: url,
            success: function (data) {

                var list = list_topstory = intro = author = "", smallimg = "", largeimg = "", image = catstr = catstr_lc = "", count = category = 0;
                var count_total = 0;

                try {
                    var obj = JSON.parse(data);

                    //console.log(data);
                    count_total = obj.count_total;
                    for (var i = 0; i < obj.posts.length; i++) {
                        var entry = obj.posts[i];

                        if (entry.id && entry.title && entry.status == "publish") {

                            date = entry.date;
                            datestr = new Date(date.replace(/-/g, "/")).toDateString() + " " + new Date(date.replace(/-/g, "/")).toLocaleTimeString();

                            smallimg = ""; largeimg = ""; image = "";
                            if (entry.thumbnail) {
                                smallimg = entry.thumbnail;
                                largeimg = entry.thumbnail_images.full.url;
                            }

                            image = largeimg;

                            if (entry.author) {
                                author = entry.author.name;
                            }

                            catstr = entry.categories[0].title;
                            category = entry.categories[0].id;
                            catstr_lc = entry.categories[0].slug.toLowerCase();



                            intro = strip_tags(entry.excerpt).substr(0, 100);

                            instruction = "onclick=\"news.load_content(" + entry.id + "); $.ui.loadContent('#news_item',false,false,'none');\"";
                            navitem = { id: entry.id, title: entry.title, author: author, catstr: catstr, catstr_lc: catstr_lc, intro: intro, date: datestr, img: smallimg, large_img: largeimg, instruction: instruction };
                            list += $.template("tpl_items_list", { navitem: navitem });

                            if (!duplicate(news.items_arr, entry.id)) {
                                /*add to loaded news array. NOT SO SURE ABOUT THIS. flag*/
                                var arr = [entry.id, entry.title];
                                news.items_arr.push(arr);
                            }


                            count += 1;
                        }
                    }
                } catch (x) { console.log(x.message); }

                if (count == 0) {
                    if (news.curr_search_page == 1) {
                        $("#search_result_list").html("<li>Your search retunned 0 results</li>");
                        $("#load_more_search_ul").hide();
                    }
                    else {
                        $("#load_more_search_link").html("Reached end of list");
                    }
                }
                else {
                    if (news.curr_search_page == 1) {
                        $("#search_result_list").html(list);
                        $("#search_title").html(count_total + " item(s) found");
                    }
                    else {
                        $("#search_result_list").append(list);
                    }

                    /*if its page 1, display the load more button*/
                    $("#load_more_search_ul").show();
                    $("#load_more_search_link").html("Load more");


                    hide_broken_images(true);
                }

                /*hide the loader and bad images*/
                $.ui.hideMask();

            }, timeout: "30000",
            error: function (xhr) {
                alert(SERVER_UNREACHABLE);
                $.ui.hideMask();
            }
        });
    }
};






var saved_news = {

    load: function () {

        try {
            var count = 0, remoteid = smallimg = delete_btn = largeimg = image = url = list = list_topstory = categorystr = category_slug = intro = date = time = details = excerpt = instruction = author = "";

            var objectStore = db.transaction("Bookmarks").objectStore("Bookmarks");

            //objectStore.openCursor(null, "prevunique").onsuccess = function (event) {
            objectStore.index('remoteid').openCursor(null, "prevunique").onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {

                    /*get all the details*/


                    remoteid = cursor.value.remoteid;
                    details = cursor.value.details;
                    excerpt = cursor.value.excerpt;
                    title = cursor.value.title;
                    categorystr = cursor.value.categorystr;
                    datestr = date = cursor.value.date;
                    author = cursor.value.author;
                    category_slug = cursor.value.category_slug;


                    intro = strip_tags(excerpt).substr(0, 100);

                    smallimg = cursor.value.thumb;
                    largeimg = cursor.value.image;
                    image = "";

                    instruction = "onclick=\"news.load_content(" + remoteid + ",'Bookmarks');$.ui.loadContent('#news_item',false,false,'none');\"";
                    delete_btn = "<li style='padding:5px; background:#303030; color:#f60;' onclick=\"if(confirm('Delete?')){saved_news.delete_item(" + remoteid + ");}\"><span class='left tiny'>added " + datestr + " </span><span class='right'>Delete</span><div class='clear'></div></li>";

                    navitem = { id: remoteid, title: title, catstr: categorystr, author: author, catstr_lc: category_slug, intro: intro, date: datestr, img: smallimg, large_img: largeimg, instruction: instruction };

                    list += "<div id='saved_news_" + remoteid + "'>" + delete_btn + $.template("tpl_items_list", { navitem: navitem }) + "</div>";


                    if (!duplicate(news.items_arr, remoteid)) {
                        var arr = [remoteid, title];
                        news.items_arr.push(arr);
                    }

                    count += 1;
                    cursor.continue();
                }
                else {
                    if (count > 0) {
                        $("#savednews_list").html(list);
                        is_savednews_loaded = true;
                        hide_broken_images(true);
                    }
                    else {
                        /*load from online*/
                        $("#savednews_list").html("<li>There are no saved items at the moment.</li>");
                    }
                }
            };


        }
        catch (x) {
            console.log(x.message);
        }
    },

    delete_item: function (remoteid) {
        try {
            var objectStore = db.transaction("Bookmarks", "readwrite").objectStore("Bookmarks");
            objectStore.openCursor().onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    var id = cursor.value.id;
                    var this_id = cursor.value.remoteid;
                    console.log('checking ' + this_id + ' against ' + remoteid);
                    if (this_id == remoteid) {
                        objectStore.delete(id);
                        /*hide the container if its a saved item*/
                        try { $("#saved_news_" + remoteid).hide(); } catch (x) { }
                    }
                    cursor.continue();
                }
                else {
                }
            };
        }
        catch (x) {
            console.log(x.message);
        }

        try { $("#saved_news_" + id).hide(); } catch (x) { }
        try { $('#news_save_button').html("<div onclick=\"news.save_current()\">Add to Bookmarks</div>"); } catch (x) { }
    }
}










var comments = {
    current_page: 1, /*hold value of first and last displayed items. so on refresh or load more can pull accordingly*/
    stop_id: 0,
    current_type: '',
    current_id: 0,
    items_arr: new Array(),

    fetch: function (page, fetch_mode) {

        var url = "";
        /*url = "https://public-api.wordpress.com/rest/v1/sites/newtelegraphonline.com/posts/"+id+"/replies/?pretty=1&number=2&page=2&status=approved";*/
        //url = "https://public-api.wordpress.com/rest/v1/sites/newtelegraphonline.com/posts/"+CURRENT_ITEM_ID+"/replies/?&number=5&page="+page+"&status=approved";

        url = URL + '?json=get_post&id=' + CURRENT_ITEM_ID + '&include=comments';

        var progress_div = "<div id='progress_divc' class='pad loadmore'>Loading comments</div>";

        if (fetch_mode == "new") {
            comments.current_page = 1;
            $("#comments_list").html(progress_div);
        }
        if (fetch_mode == "old") {
            //$("#comments_list").append(progress_div);
            $("#load_more_comment_link").html("Loading..");
        }
        if (fetch_mode == "recent") {
            $("#comments_list").prepend(progress_div);
        }


        console.log(url);
        commentsrequest = $.ajax({
            url: url,
            success: function (data) {

                var list = user = comment = smallimg = datestr = largeimg = image = "", count = 0;

                try {
                    var obj = JSON.parse(data);
                    var obj_length = obj.length;
                    var count = 0;

                    //for(var i=0; i<obj.post.length; i++)
                    //{
                    //var entry = obj.post;
                    //entry.comments

                    for (var i = 0; i < obj.post.comments.length; i++) {
                        var entry = obj.post.comments[i];

                        console.log('id is ' + entry.id);
                        if (entry.id && (!duplicate(comments.items_arr, entry.id))) {
                            date = entry.date;
                            console.log('date is ' + date);
                            date = date.replace(/T/g, " ");
                            date = date.replace(/\+01:00/g, " ");

                            datestr = new Date(date.replace(/-/g, "/")).toDateString() + " " + new Date(date.replace(/-/g, "/")).toLocaleTimeString();

                            /*create comments with values to pass to the templater	*/

                            image = "img/user.png";

                            try {
                                if (entry.author.avatar_URL) {
                                    image = entry.author.avatar_URL;
                                }
                            } catch (x) { }

                            user = entry.name;

                            comment = entry.content;

                            navitem = { id: entry.id, imgurl: image, date: datestr, author: user, comment: comment };

                            list += $.template("tpl_comments_list", { navitem: navitem });

                            var arr = [entry.id, comment, user];
                            comments.items_arr.push(arr);

                            count += 1;
                        }
                    }
                } catch (x) { console.log(x.message); }

                if (count == 0) {
                    if (fetch_mode == "new") {
                        $("#comments_list").html("<div class='pad'><h3>This item has no comment at the moment</h3></div>");
                    }
                    if (fetch_mode == "old") {
                        //$("#progress_divc").html("Reached end of the list");
                        //setTimeout(function () {$("#progress_divc").remove();}, 3000);
                        /*since we found nothing reduce the page number*/
                        comments.current_page = comments.current_page - 1;
                        if (comments.current_page <= 0) { comments.current_page = 1; }
                        allow_load_more_comments = true;
                        $("#load_more_comment_link").html("Reached end of the list");
                    }
                    if (fetch_mode == "recent") {
                        $("#progress_divc").html("Reached top of the list");
                        setTimeout(function () { $("#progress_divc").remove(); }, 3000);
                    }

                }
                else {
                    /*push respective strings*/
                    if (fetch_mode == "old") {
                        $("#comments_list").append(list);
                        //setTimeout(function () {$("#progress_divc").remove();}, 2000);
                        allow_load_more_comments = true;
                        $("#load_more_comment_link").html("Load more");
                    }
                    else if (fetch_mode == "recent") {
                        $("#comments_list").prepend(list);
                        setTimeout(function () { $("#progress_divc").remove(); }, 3000);
                    }
                    if (fetch_mode == "new") {
                        $("#comments_list").html(list);
                    }

                    $("#load_more_comment_ul").show();
                }

                /*hide the loader* and bad images*/
                $.ui.hideMask();
                hide_broken_images();

            }, timeout: "20000",
            error: function (xhr) {
                alert(SERVER_UNREACHABLE);

                if (fetch_mode == "new") { $("#comments_list").html("<div class='pad'><h3><i class='icon error'></i>" + SERVER_UNREACHABLE + "</h3></div>"); }
                else { try { $("#progress_divc").html("<i class='icon error'></i>" + SERVER_UNREACHABLE); } catch (x) { } }

                try { setTimeout(function () { $("#progress_divc").remove(); }, 3000); } catch (x) { }
                $.ui.hideMask();
                //console.log("ERROR FETCHING comments "+xhr.message+" Err: "+xhr.message+" code: "+xhr.code);
            }
        });
    },

    post_comment: function () {
        var name = $("#new_comment_name").val();
        var email = $("#new_comment_email").val();
        var origin_email = email;
        //email = email.replace(/@/g, "%40");
        var comment = $("#new_comment_text").val();


        if (comment && name && email && CURRENT_ITEM_ID) {
            $.ui.showMask('Posting Comment..');

            //var url = URL+"api/?json=submit_comment&post_id="+CURRENT_ITEM_ID+"&name="+escape(name)+"&email="+email+"&content="+escape(comment);
            var url = "http://www.layifunsho.com/post_comment_newt.php?passcode=123NDS&post_id=" + CURRENT_ITEM_ID + "&name=" + escape(name) + "&email=" + encodeURIComponent(email) + "&content=" + escape(comment);
            url = "http://www.layifunsho.com/post_comment_newt.php?passcode=123NDS&post_id=" + CURRENT_ITEM_ID + "&name=" + escape(name) + "&email=" + email + "&content=" + escape(comment);

            console.log(url);

            commentsrequest = $.ajax({
                url: url,
                success: function (data) {

                    console.log(data);
                    var obj = JSON.parse(data);

                    if (obj.id > 0) {
                        //clear the input forms/
                        alert("Comment posted successfully.");

                        $("#new_comment_text").val("");

                        var date = new Date(),
                                last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

                        navitem = { imgurl: "img/user.png", date: date, author: name, comment: comment };
                        list += $.template("tpl_comments_list", { navitem: navitem });


                        $("#comments_list").prepend(list);
                        $.ui.hideMask();
                        $.ui.goBack();

                        //save users name and email/
                        db.transaction(function (tx) {
                            tx.executeSql("UPDATE Settings SET email = ?, fullname=? ", [email, name]);
                        }, errorCB);
                    }
                    else {
                        alert("Error encountered. " + obj.error);
                        $.ui.hideMask();
                    }

                }, timeout: "20000",
                error: function (xhr) {
                    alert(SERVER_UNREACHABLE);
                    $.ui.hideMask();
                }
            });
        }
        else {
            alert("Please enter your details and a comment.");
        }
    }
}







var page = {

    current_title: '',
    load: function (title) {
        try {
            if (title) {
                page.current_title = title;

                var objectStore = db.transaction("Settings").objectStore("Settings");

                objectStore.openCursor().onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        var text = cursor.value.about_app;


                        if (text != "" && text != undefined) {
                            $("#page_content").html(text);
                        }
                        else {

                            page.fetch(title);
                        }
                    }
                    else {
                        page.fetch(title);
                    }
                };
            }
            else {
                alert("Error: This item cannot be displayed.");
            }
        } catch (x) { console.log(x.message); }
    },


    fetch: function (title) {


        $.ui.showMask('Loading Content..');

        newsrequest = $.ajax({
            url: URL + "?json=get_page&slug=" + title,
            success: function (data) {

                try {
                    var count = 0;
                    var obj = JSON.parse(data);

                    if (obj.page.id > 0) {
                        var details = "<h3>" + obj.page.title + "</h3> " + obj.page.content;

                        if (details == "") { details = "Content Not Found. Please try again later."; }
                        //save the date modified too in the database	
                        var date = new Date();
                        var last_active = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear().toString() + "   " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
                        details = details + "<p style='font-size:0.8em; color:#666'>Last updated: " + last_active + "</p>";

                        //save the details. delete first									
                        update_store("Settings", 1, "about_app", details);

                        $("#page_content").html(details);

                        count += 1;
                    }
                    else {
                        $("#page_content").html("Error encountered while loading content.");
                    }

                } catch (x) {/*console.log(x.message);*/ }

                if (count == 0) {
                    alert("Failed to load content. Please try again later.");
                    var current_content = $("#page_content").html();
                    if (!current_content) {
                        $("#page_content").html("<div><h3>Failed to load content. Please try again.</h3></div>");
                    }
                }

                $.ui.hideMask();



            }, timeout: "20000",
            error: function (xhr) {
                var current_content = $("#page_content").html();
                if (!current_content) {
                    $("#page_content").html("<div><h3>Failed to load content. Please make sure you are connected to the Internet and try again.</h3></div>");
                }
                $.ui.hideMask();
                alert("Failed to load content. Please make sure you are connected to the Internet and try again.");
                //console.log("ERROR FETCHING page "+xhr.message+" Err: "+xhr.message+" code: "+xhr.code);
            }
        });
    }

};







var advert = {

    /*this var basically fetches the adverts to display through out the app*/
    load_all: function () {

        var url = "http://10.132.211.245/newtelegraph_adserver/app_request.php?passcode=123NDS&action=get_advert&ad_mode=main&timestamp=" + (new Date()).getTime();
        var AD_URL = "http://10.132.211.245/newtelegraph_adserver/admin_controller/generalItem/Mobile_AdImages/";

        console.log("----------- loading ads");
        adrequest = $.ajax({
            url: url,
            success: function (data) {
                console.log("----------- data");
                try {
                    var count = 0;
                    var obj = JSON.parse(data);

                    for (var i = 0; i < obj.length; i++) {
                        if (obj[i].position) {
                            var title = obj[i].title;
                            //this determines where the ad will be placed
                            var position = obj[i].position.toLowerCase();
                            var url = obj[i].url;


                            var advert_content = "";

                            if (url) {
                                //make sure the url has http://. so first remove it if any then append
                                //url.replace(/-/g, "/")
                                advert_content = "<img src='" + AD_URL + obj[i].imageid + "." + obj[i].imageformat + "' onClick=\"window.open('" + url + "', '_system');\"/>";
                            }
                            else {
                                advert_content = "<img src='" + AD_URL + obj[i].imageid + "." + obj[i].imageformat + "'/>";
                            }
                            //for each position, insert the ad
                            try { $("#" + position).html(advert_content); } catch (x) {/*console.log("ad display error: "+x.message);*/ }



                            count += 1;
                        }
                    }
                } catch (x) {/*console.log(x.message);*/ }

                /*console.log("ADS LOADED!!");*/

            }, timeout: "20000",
            error: function (xhr) {
                console.log('could not reach ' + url + ' - ' + xhr.message);
            }
        });



        /*call the image hide in case there is no internet
		hide adverts that wont show. show all first*/
        $(".ad_content img").error(function () {
            $(this).hide();
        });
    }
}



function reset_application() {
    if (confirm('This will reset your application. All information and saved settings will be lost. Continue?')) {
        news.items_arr = [];
        $.ui.showMask('Resetting. Please wait');
        populateDB_delete();
        window.setTimeout(function () { $.ui.hideMask(); }, 3000);
    }
}




/******************************************* NON DB FUNCTIONS *************************************************************************/

/*fade in images*/
/*
function imgLoaded(img){
    var imgWrapper = img.parentNode;
 
    imgWrapper.className += imgWrapper.className ? ' loaded' : 'loaded';
};*/



/* Play audio*/
function playAudio(type) {
    navigator.notification.beep(1);
}
function playAudiox(type) {


}
/*vibrate*/
function shake_phone() {
    /*vibrate the device for half a second*/
    navigator.notification.vibrate(500);
}

function showShare(title, text) {
    //create a set of links based on the news categories
    /*if(txt != ""){share_text = txt;}
	if(title != ""){share_title = title;}*/

    try { title = strip_tags(title); text = strip_tags(text); } catch (x) { }
    if (title == "" || !title) { title = strip_tags(share_title); }
    if (text == "" || !text) { text = strip_tags(share_text); }



    var tweet = share_title + " via New Telegraph for Blackberry.";
    var tweet_url = "http://twitter.com/share?text=" + tweet + "&url=" + SITE_URL;
    var fb_url = "http://www.facebook.com/sharer.php?u=" + SITE_URL + "&t=" + share_title;
    share_text = share_text + "..";

    var sharebtn = "<a onclick=\"if(confirm('Share on Twitter?')){loadURL_direct('" + tweet_url + "');}\" class='share'>Tweet</a><a onclick=\"if(confirm('Share on Facebook?')){loadURL_direct('" + fb_url + "');}\"  class='share'>Facebook</a><a onclick=\"window.location.href='sms:080?text=" + strip_tags(tweet) + "'\" class='share'>SMS</a><a onclick=\"window.location.href='mailto:receiver@mail.com?subject=" + tweet + "&body=" + strip_tags(share_text) + "'\" class='share'>Email</a>";
    $("#afui").actionsheet(sharebtn);
}

/*
function share(text) {				
	var title=strip_tags(share_title); 
	if(text){title=text;}
	var text = "Download New Telegraph App from Windows Phone Store";

	window.plugins.share.show({
		subject: title,
		text: text },
		function() {}, // Success function
		function() {$("#afui").popup("Share cancelled");} // Failure function
	);
}*/


function strip_tags(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
    // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

function hide_broken_images(show) {
    $("img").error(function () {
        if (show) {
            $(this).attr("src", "img/logo_fade.png");
        }
        else {
            $(this).hide();
        }
    });
}



function loadURL(url) {
    //navigator.app.loadUrl(url, { openExternal:true });
    //return false;
    window.open(url, '_system');
}

function loadURL_direct(url) {
    window.open(url, '_system');
}


function checkConnection() {

    return true;
    /*
	var networkState = navigator.connection.type;

	if(navigator.connection.type == Connection.NONE)
	{
		return false;
	}
	else
	{
		return true;
	}*/
}


function showHide(obj, objToHide) {
    var el = $("#" + objToHide)[0];

    if (obj.className == "expanded") {
        obj.className = "collapsed";
    } else {
        obj.className = "expanded";
    }
    $(el).toggle();

}

function fadeInOut(obj) {

    obj = $("#" + obj);
    if (obj.hasClass("faded_in")) {
        obj.removeClass("faded_in");
        obj.addClass("faded_out");
    } else {
        obj.removeClass("faded_out");
        obj.addClass("faded_in");
    }
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



