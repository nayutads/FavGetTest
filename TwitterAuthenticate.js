const {TwitterOAuth} = require('twitter-auth-await');
const fs=require('fs');
const url=require('url');
const queryString=require('querystring');



module.exports=function(readPinFunc,notifyUrlFunc,twitter_auth_obj){
    
    return new Promise((onResolved,onRejected)=>{

        let result;
        console.log((twitter_auth_obj.Access_token)&&(twitter_auth_obj.Access_token_secret));

        if(twitter_auth_obj.Access_token && twitter_auth_obj.Access_token_secret) return;
        const twitterClient=new TwitterOAuth({
            consumerKey:twitter_auth_obj.API_Key,
            consumerSecret:twitter_auth_obj.API_Key_secret,
            callback:'oob'  
        });
        let redirectUri;
        let pin,token;

        twitterClient.getRedirectAuthURI()
        .then(r=>{
            redirectUri=r;
            notifyUrlFunc(redirectUri);
            return readPinFunc();
        })
        .then(code=>{
            pin=code;
            token=(queryString.parse((url.parse(redirectUri)).query)).oauth_token;
            return twitterClient.getAccessToken(token,pin);
        })
        .then(res=>{
            return onResolved(res);
        })
        .catch(err=>{
            return onRejected(err);
        });
    });

}