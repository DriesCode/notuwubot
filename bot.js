
var twit = require('twitter');
var config = require('./config.js');

const fs = require('fs');

var T = new twit(config);

var lastId;

var filter = "uwu";

var rep1 = "You have used 'uwu'. Consider taking a bath, please ";
var rep2 = "Woah, looks like you have used 'uwu'. Please, consider taking a bath ";
var rep3 = "Hello. Here I am to advice you to take a bath. You have used 'uwu'. Thanks ";
var rep4 = "No matter what, you have used the word 'uwu', so you should consider taking a bath. You're welcome ";

//console.log(`Running, looking for: ${filter.track}`);

function isReply(tweet) {
    if ( tweet.retweeted_status
      || tweet.in_reply_to_status_id
      || tweet.in_reply_to_status_id_str
      || tweet.in_reply_to_user_id
      || tweet.in_reply_to_user_id_str
      || tweet.in_reply_to_screen_name )
      return true
}

function reportError(error) {
    //console.log("Reporting error...");
    let text = error + " @a7escalona";

    T.post('statuses/update', {status: text}, (err, data, resp) => {
        if (!err) {
            //console.log("Sent report");
        } else console.log(err);
    })
}

var n = 10;
main(n);

function main(num) {
    fs.readFile('last_id.txt', 'utf-8', (err, data) => {
        if (!err) {
            lastId = data;
            //console.log("New lastId: ", lastId)
        } else reportError(err);

        T.get('search/tweets', {q: filter, count: num, result_type: "recent", since_id: lastId}, (err, data, resp) => {
            if (err) {
                reportError(err);
                //console.log("resp ", resp);
            } else {
                //console.log("Wanted " + n + "  and read " + Object.keys(data.statuses).length);

                for (let i = 0; i < Object.keys(data.statuses).length; i++) {
                    if (!isReply(data.statuses[i])) {
                      let num = Math.floor(Math.random() * 100);
                      let stat;
                      let user = data.statuses[i].user.screen_name;

                      if (((num % 2) == 0 ) && num > 50) {
                          stat = rep1 + "@"+user;
                      } else if (((num % 2) == 0 ) && num < 50) {
                          stat = rep2 + "@"+user;
                      } else if (((num % 2) != 0 ) && num > 50) {
                          stat = rep3 + "@"+user;
                      } else if (((num % 2) != 0 ) && num < 50) {
                          stat = rep4 + "@"+user;
                      }

                      T.post('statuses/update', {
                          status: stat,
                          in_reply_to_status_id: data.statuses[i].id_str
                      }, (err, data, resp) => {
                          if (!err) {
                              console.log("Tweeted to ", user);
                          } else reportError(err);
                      });
                    }
                }

                fs.writeFileSync('last_id.txt', data.statuses[0].user.id_str, 'utf-8');
                console.log(`Updated lastId from ${lastId} to ${data.statuses[0].user.id_str}`);
            }
        });
    });


}

