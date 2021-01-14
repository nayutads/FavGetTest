const readline=require('readline');

module.exports=function(){
    const line=readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    return new Promise((onResolved,onRejected)=>{
        line.question('Enter PIN ',res=>{
            onResolved(res);
            line.close();
        });
    });
}