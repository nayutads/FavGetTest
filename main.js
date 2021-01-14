const oauth=require('./TwitterAuthenticate');
const readPINCode=require('./readPINCode');
const fs = require('fs');
const open=require('open');
const Twitter=require('twitter');
const wait=require('./wait');


const twitter_conf_filename='./twitter_keys.json';
const twitter_auth_obj=JSON.parse(fs.readFileSync(twitter_conf_filename));


if(process.argv.length!==4){
    console.error('引数の数を合わせてください');
    return;
}

const username=process.argv[2];
const searchword=process.argv[3];

async function search_fav_recursive(data,depth,breadth,users,tweets,keyword,period){
    await wait(period);
    if(breadth>200 || depth<=0 || data==null) return;   //favorites/listのcountは200以下

    if(!(data.user)) return;
    const name=data.user.screen_name;

    if(name in users) return;   //過去に辿った人は追わない

    let result;
    client.get('favorites/list',{screen_name:name,count:breadth})
    .then(async(d)=>{
        result=d;
        users[name]=result;
        for(let r of result){
            let text=r.text;
            if(!(text.includes(keyword))) continue;
            let id=r.id_str;
            tweets[id]=r;
            await search_fav_recursive(r,depth-1,breadth,users,tweets,keyword,period);
        }
    })
    .catch(err=>{
        console.error(err);
    });
}


oauth(readPINCode,open,twitter_auth_obj)
.then(res=>{
    twitter_auth_obj.Access_token=res.accessToken;
    twitter_auth_obj.Access_token_secret=res.accessTokenSecret;
    twitter_auth_obj.userId=res.userId;
    twitter_auth_obj.screenName=res.screenName;
    fs.writeFileSync(twitter_conf_filename,JSON.stringify(twitter_auth_obj))
})
.catch(e=>{
    console.error(e);
});


const client=new Twitter({
    consumer_key:twitter_auth_obj.API_Key,
    consumer_secret:twitter_auth_obj.API_Key_secret,
    access_token_key:twitter_auth_obj.Access_token,
    access_token_secret:twitter_auth_obj.Access_token_secret
});

let tweets=undefined;
usersobj=new Object();
tweetsobj=new Object();

client.get('favorites/list',{screen_name:username,count:10})
.then(async(data)=>{
    usersobj[username]=data;
    for(let d of data){
        let text=d.text;
        if(!(text.includes(searchword))) continue;
        let id=d.id_str;
        tweetsobj[id]=d;
    }
    for(let d of data){
        await search_fav_recursive(d,3,10,usersobj,tweetsobj,searchword,0.5);
    }
    for(let tw in tweetsobj){
        console.log(tweetsobj[tw]);
    }
})
.catch(err=>{
    console.error(err);
});