(function main(){

    if (window.hasRun) {
        return;
      }
    window.hasRun = true;
    
    var userDataJson = {};

    // debug
    //chrome.storage.sync.clear();

    // svgs
    var $linkSVG = $('<path d="M15.8286,15.8998 C15.3466,16.3788 12.6326,15.5598 8.5516,11.4798 C4.4706,7.3968 3.6486,4.6858 4.1316,4.2038 C4.3566,3.9788 4.9286,3.9208 5.9126,4.3518 C5.6166,4.5678 5.3306,4.8008 5.0666,5.0658 C5.0536,5.0798 5.0416,5.0948 5.0266,5.1098 C5.5756,6.4268 6.8946,8.4088 9.2596,10.7728 C11.6206,13.1338 13.6046,14.4538 14.9246,15.0028 C14.9376,14.9898 14.9526,14.9778 14.9666,14.9638 C15.2316,14.6988 15.4646,14.4128 15.6786,14.1178 C16.1096,15.1028 16.0526,15.6748 15.8286,15.8998 M16.7526,11.8998 C17.4066,9.5458 16.8136,6.9138 14.9666,5.0658 C13.6436,3.7438 11.8866,3.0148 10.0166,3.0148 C9.3686,3.0148 8.7356,3.1078 8.1286,3.2768 C5.7306,1.7598 3.9176,1.5898 2.7176,2.7898 C1.4036,4.1028 2.0736,6.1918 3.2866,8.1688 C2.6446,10.5128 3.2276,13.1258 5.0666,14.9638 C6.3886,16.2868 8.1456,17.0148 10.0166,17.0148 C10.6536,17.0148 11.2746,16.9178 11.8736,16.7518 C13.0856,17.4938 14.3406,18.0318 15.4316,18.0318 C16.1156,18.0318 16.7366,17.8198 17.2426,17.3138 C18.4416,16.1138 18.2706,14.2988 16.7526,11.8998"></path>');
    var $crossSVG = $('<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path d="M11.41 10l4.29-4.29a1 1 0 0 0-1.41-1.41L10 8.59l-4.29-4.3a1 1 0 0 0-1.42 1.42L8.59 10l-4.3 4.29A1 1 0 1 0 5.7 15.7l4.3-4.29 4.29 4.29a1 1 0 0 0 1.41-1.41z" fill="rgb(200,20,20)"></path></svg>');

    // Get data from local storage
    function loadUserData(){
        chrome.storage.sync.get(['userData'],function(items){
            //console.log(items);
            if(items.hasOwnProperty('userData'))userDataJson=items.userData;
            else userDataJson={};
            // First time link refresh
            refreshLinks();
        });
    }

    function saveUserData(){
        chrome.storage.sync.set({'userData':userDataJson});
    }

    // First time load;
    loadUserData();


    // Add links to the hamburgers bar
    function refreshLinks(){

        //check if header-subreddit-filter ID exists
        if($('#focus-OC').length){
            let $ref = $('#focus-Home');
            let $before = $('#focus-OC');
            $ref.parent().find('.multireddit-list').remove();
            for(let feed in userDataJson[getUserName()]){
                let $clone = $ref.clone().addClass('multireddit-list');
                $clone.find('span').html(feed);
                $aClone = $clone.clone();
                $clone.attr('href','/r/'+userDataJson[getUserName()][feed].join('+')).css('flex','auto');
                $aClone.click(function(e){
                    if(e.which==2)return;
                    e.preventDefault();
                    removeFeed(feed);
                })
                $aClone.find('svg').replaceWith($crossSVG.clone());
                $aClone.find('span').remove();
                $aClone.removeClass();
                $clone.append($aClone);
                $before.after($clone);
                $before=$before.next();
            }
        }
        // remove existing
        /*$('#hamburgers').find('.multireddit-list').remove();

        for(var feed in userDataJson[getUserName()]){
            let $par = $('#hamburgers').children().first().children().last();
            let $clone = $par.children().first().clone();
            //$clone.find('path').replaceWith($linkSVG);
            $aClone = $clone.find('a').clone();
            $clone.find('a').attr('href','/r/'+userDataJson[getUserName()][feed].join('+')).css('flex','auto');
            $clone.find('span').html(feed)
            $clone.addClass('multireddit-list')

            $aClone.click(function(e){
                if(e.which==2)return;
                e.preventDefault();
                removeFeed(feed);
            })
            $aClone.find('svg').replaceWith($crossSVG.clone());
            $aClone.find('span').remove();
            $clone.append($aClone);
            $par.append($clone);
        }*/
    }

    // Reload data if modified on other tabs;
    chrome.storage.onChanged.addListener((changes,area)=>{
        loadUserData();
    });
    
    // Create popup element
    function createPopup($parent){
        //delete existing one first
        $('#multireddit-popup').remove();

        var $popup = $('<div>',{id:'multireddit-popup'});
        $popup.css('width',$(window).width()/7);
        $popup.append($('<div>',{id:'multireddit-popup-text'}));
        $popup.append($('<div>',{id:'multireddit-popup-list'}));
        $parent.append($popup);
    };

    function getUserName(){
        var $userName = $("#USER_DROPDOWN_ID").children().first().children().first().children().last().children().first();
        if($userName.children().length>0)return "[common]";
        return $userName.html();
    }

    function showPopup(newSub,top,left,$parent){
        // create new popup
        createPopup($('body'));

        //var position = $parent.offset();
        var width = parseInt($('#multireddit-popup').css('width'));
        
        $('#multireddit-popup-text').html('<h3>Add r/'+newSub+' to:</h3>');
        $('#multireddit-popup').css('top',top+50);
        $('#multireddit-popup').css('left',Math.min($(window).width()-width-20,left-width/2));

        if(!userDataJson.hasOwnProperty(getUserName())){
            userDataJson[getUserName()]={};
        }

        for(var key in userDataJson[getUserName()]){
            let $checkbox = $('<input>',{type:'checkbox',value:key,name:newSub}).click(function(e){
                if($(this).is(':checked')){
                    // Add to Json
                    addToJson($(this).attr('name'),$(this).attr('value'));
                }else{
                    removeFromJson($(this).attr('name'));
                }
            });
            let $label = $('<label>',{class:'container'}).html(key);
            $label.append($checkbox).append($('<span>',{class:'checkmark'})); 
            $('#multireddit-popup-list').append($label);
        }

        // Add a new feed option at the end
        let $checkbox = $('<input>',{type:'checkbox'}).click(function(e){
            let feed = $(this).next().val() || $(this).next().html();

            if($(this).parent().find('input').length!=1){
                // clean up - replace input with label
                feed = $(this).next().next().val();
                if(!isFeedNameValid(feed)){
                    e.preventDefault();
                    return;
                }
                $(this).parent().append(feed);
                $(this).next().next().remove();
            }else{
                feed = $(this).parent()[0].innerText;
            }

            if($(this).is(':checked')){
                // Add to Json
                addToJson(newSub,feed);
            }else{
                removeFromJson(newSub);
            }
        });
        let $input =$('<input>',{type:'text',placeholder:'New Feed'}).keypress(function(e){
            if(e.which==13){
                if(!isFeedNameValid($(this).val()))return;
                //let $label = $('<label>').html($(this).val());
                //$(this).parent().append($label);
                $(this).parent().append($(this).val());
                $(this).remove();
            }
        });
        $('#multireddit-popup-list').append($('<label>',{class:'container'}).append($checkbox).append($('<span>',{class:'checkmark'})).append($input));

        $('#multireddit-popup').show();
    }
    

    // Add a global click listener because new Reddit is based
    // on React which tends to completely replace elements when clicked etc.,
    // So adding click handlers to buttons will not work
    document.addEventListener('click',event => {

        // Ignore right-clicks
        if (event.button == 2)
        return;

        let elem = event.target;

        // First hide the popup if the click is somewhere not on the popup
        if(!$(elem).closest('#multireddit-popup').length){
            if($('#multireddit-popup').is(':visible'))
            $('#multireddit-popup').hide();
        }

        if(elem.tagName==='BUTTON'){
            if(elem.innerHTML=="Subscribe" || elem.innerHTML === '' && event.composedPath().length>=3){
                // Try to check if a neighbhoring anchor is present and if present, points to a subreddit
                let $parent =$(event.composedPath()[2]);
                let href = $parent.find('a').first().attr('href');
                let subRed = href.match(/^\/r\/(.*)/);
                if(subRed){
                    if(elem.innerHTML=="Subscribe"){
                        // Subscribe
                        showPopup(subRed[1],event.clientY,event.clientX,$parent);
                        //console.log(elem.getBoundingClientRect().top);
                    }else{
                        // Unsubscribe
                        removeFromJson(subRed[1]);
                    }
                }
            }
            // The button clicked maybe the onw that shows feeds..so refresh links
            loadUserData();
        }
    });


    //check validity of new feed name
    function isFeedNameValid(feed){
        if (!feed)return false;
        for(var key in userDataJson[getUserName()]){
            if(key==feed)return false;
        }
        return true;
    }

    function addToJson(subR,subRfeed){
        // Check if username exists
        let uname= getUserName();
        if(!userDataJson.hasOwnProperty(uname)){
            userDataJson[uname]={};
        }
        if(!userDataJson[uname].hasOwnProperty(subRfeed)){
            userDataJson[uname][subRfeed]=[];
        }
        //strip trailing '/' from sub name
        if(subR.indexOf('/')>=0)subR=subR.slice(0,-1);

        if(userDataJson[uname][subRfeed].indexOf(subR)>=0){
            //Skip as sub already present
        }else{
            userDataJson[uname][subRfeed].push(subR);
            //console.log('Added '+subR+' to '+subRfeed);
        }
        
        //save to storage
        saveUserData();
    }

    function removeFromJson(subR){
        if(subR.indexOf('/')>=0)subR=subR.slice(0,-1);
        //console.log("removing "+subR+' from lists');
        let uname= getUserName();
        if(userDataJson.hasOwnProperty(uname)){
            for(var feed in userDataJson[uname]){
                userDataJson[uname][feed]=userDataJson[uname][feed].filter(item=>item!==subR);
                if(userDataJson[uname][feed].length==0){
                    delete userDataJson[uname][feed];
                }
            }
        }
        //save to storage
        saveUserData();
    }
    function removeFeed(feed){
        let uname= getUserName();
        if(userDataJson.hasOwnProperty(uname)){
            if(userDataJson[uname].hasOwnProperty(feed)){
                delete userDataJson[uname][feed];
            }
        }
        saveUserData();
    }

})();


