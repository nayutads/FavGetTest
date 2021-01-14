module.exports=async function(time){
    return new Promise((resolved,rejected)=>{
        setTimeout(resolved,time*1000);
    });
}