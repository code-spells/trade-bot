const pairJSON = require("./pairABI.json");
const routerContractJson = require ("./contractABI.json");
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(`https://bsc-dataseed4.binance.org/`));
async function swap(token,amount,privatekey,receiverAddress){
    await web3.eth.accounts.wallet.add(privatekey);
    const routerContract = new web3.eth.Contract(routerContractJson, "0x10ED43C718714eb63d5aA57B78B54704E256024E");
    const WETH = await routerContract.methods.WETH().call()
    const path = [WETH,token];
    const deadline = (Date.now()+1000);
    const to = receiverAddress;
    const amountMin = await routerContract.methods.getAmountsOut(amount,path).call();
    const estimateGas = await routerContract.methods.swapExactETHForTokens(amountMin[amountMin.length-1],path,to,deadline).estimateGas({from: to});
    const response = await routerContract.methods.swapExactETHForTokens(amountMin[amountMin.length-1],path,to,deadline).send({
          from:to,
          gas:estimateGas,
          value: "1000000000000000"
    })
    console.log(response);
} 
async function checkLiquidity (previousLiquidity,token,amount,privatekey,receiverAddress){
    const pairContract = new web3.eth.Contract(pairJSON, "0x0eD7e52944161450477ee417DE9Cd3a859b14fD0");
    const pairLiquidity = await pairContract.methods.getReserves().call();
    const currentLiquidity = pairLiquidity._reserve1

    if (currentLiquidity > previousLiquidity){
        swap(token,amount,privatekey,receiverAddress);
    }

    console.log("newLiquidity :", currentLiquidity);
}

checkLiquidity(previousLiquidity,token,amount,privatekey,receiverAddress);