     // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.

      var player;
      var startTime=10;
      var videoObject = new Array();
      var callbackMethod;
      function playYoutube(url,seekTime,callBack){
       callbackMethod = callBack;
       player.loadVideoById(getyoutubeId(url), getSeakTime(), "large");
       player.playVideo();

      }
     
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '390',
          width: '640',
           events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          },
         playerVars:{'cc_load_policy':0, 'disablekb':0,'enablejsapi':1,'fs':1,'iv_load_policy':3,'loop':1,'modestbranding':1,'showinfo':0,'rel':0}
         //playerVars:{'cc_load_policy':0, 'enablejsapi':1,'controls':0,'loop':1,'showinfo':0,'rel':0}
        });
      }

      //set video id
      function getyoutubeId(videoURL){
        var x = videoURL.split("=");
        return x[1];        
      }

      function getSeakTime(time) {
        return time;
      }
      
      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {   
        player.stopVideo();   
        //player.loadVideoById(getyoutubeId(), getSeakTime(), "large");
               
      }
   
      // onPlayerStateChange helps to hanndle event when state cahage
      function onPlayerStateChange(event) {
         if(player.getPlayerState()==0){
            //onPlayerReady();
            callbackMethod();

          }
      }
  
      //to stop video
      function stopVideo() {  
        player.stopVideo();
      }






//search filter and results
      function SearchYouTube(query,callBack) {
    $.ajax({
        url: 'http://gdata.youtube.com/feeds/videos?alt=json-in-script&q=' + query,
        dataType: 'jsonp',
        success: function (data) {
             var search_items = [];
             for (i = 0; i < data.feed.entry.length; i++) {
                   
                try{
            //     // row += "<div class='search_item'>";
            //     // row += "<table width='100%'>";
            //     // row += "<tr>";
            //     // row += "<td vAlign='top' align='left'>";
            //     // row += "<a href='#' ><img width='120px' height='80px' src=" + data.feed.entry[i].media$group.media$thumbnail[0].url + " /></a>";
            //     // row += "</td>";
            //     // row += "<td vAlign='top' width='100%' align='left'>";
            //     // row += "<a href='#' ><b>" + data.feed.entry[i].media$group.media$title.$t + "</b></a><br/>";
            //     // row += "<span style='font-size:12px; color:#555555'>by " + data.feed.entry[i].author[0].name.$t + "</span><br/>";
            //     // row += "<span style='font-size:12px' color:#666666>" + data.feed.entry[i].yt$statistics.viewCount + " views" + "<span><br/>";
            //     // row += "</td>";
            //     // row += "</tr>";
            //     // row += "</table>";
            //     // row += "</div>";
                
            //    }
                
                var video = [];
                video[0] = data.feed.entry[i].link[2].href;
                video[1] = data.feed.entry[i].media$group.media$thumbnail[0].url; 
                video[2] = data.feed.entry[i].media$group.media$title.$t; 
                video[4] = data.feed.entry[i].author[0].name.$t;
                video[5] = data.feed.entry[i].yt$statistics.viewCount;
                video[6] = data.feed.entry[0].media$group.media$content[0].duration;
                search_items[i] = video;
                    }catch(e){
                        
               }
             }
                        
            callBack(search_items);
            //document.getElementById("search-results-block").innerHTML = row;
        },
        error: function () {
            callBack("Error");
        }
    });
    return false;
}

 function SearchOneYouTube(query,callBack) {
  var video = [];
  query = getyoutubeId(query);
    $.ajax({
        url: 'http://gdata.youtube.com/feeds/videos?alt=json-in-script&q=' + query+'&&max-results=1',
        dataType: 'jsonp',
        success: function (data) {
                video[0] = data.feed.entry[0].link[2].href;
                video[1] = data.feed.entry[0].media$group.media$thumbnail[0].url; 
                video[2] = data.feed.entry[0].media$group.media$title.$t; 
                video[3] = data.feed.entry[0].media$group.media$content[0].duration;
                callBack(video);
        },
        error: function () {
            callBack("Error");
        }
    });
}
    
