/*! genData v3.1.1 | github.com/bemson/genData | (c) Bemi Faison | MIT */
!function(inCJS,inAMD,Array,scope,undefined){function initGenData(){var protoSliceMethod=Array.prototype.slice,isArray=Array.isArray||function(thing){return thing instanceof Array};function filterFunctions(thing){return typeof thing==="function"}function filterNonFunctions(thing){return typeof thing!=="function"}function genData(stuff){if(this instanceof genData){return this}var queue=[["",stuff]],queueBuffer,queueItem,invocationArgs=protoSliceMethod.call(arguments),mainArgs=invocationArgs.slice(1),loopEnv,finalCallbackReturnValue,callbacks=mainArgs.filter(filterFunctions),callbackResult,callbackArgs,callbackScope,callbackIdx,sourceKey,hasFinalReturnValue,resultsArray=[],totalCallbacks=callbacks.length;if(!totalCallbacks){return[]}function Data(name,value){this.name=name;this.value=value}Data.prototype=(typeof this==="function"?this:genData).prototype;loopEnv={returns:resultsArray,args:mainArgs.filter(filterNonFunctions),params:invocationArgs,loop:0,queued:0};while(queue.length){queueItem=queue.shift();callbackScope=new Data(queueItem[0],queueItem[1]);callbackIdx=hasFinalReturnValue=0;callbackArgs=[queueItem[0],queueItem[1],queueItem[2],loopEnv];loopEnv.continues=0;loopEnv.breaks=0;loopEnv.source=queueItem[1];while(!loopEnv.continues&&callbackIdx<totalCallbacks){loopEnv.allowUndefined=0;callbackResult=callbacks[callbackIdx++].apply(callbackScope,callbackArgs);if(callbackResult!==undefined||loopEnv.allowUndefined){finalCallbackReturnValue=callbackResult;hasFinalReturnValue=1}}if(hasFinalReturnValue){resultsArray.push(finalCallbackReturnValue)}if(loopEnv.breaks){break}if(typeof loopEnv.source==="object"){queueBuffer=[];for(sourceKey in loopEnv.source){if(loopEnv.source.hasOwnProperty(sourceKey)){queueBuffer.push([sourceKey,loopEnv.source[sourceKey],callbackScope])}}queue=queueBuffer.concat(queue)}loopEnv.loop++;loopEnv.queued=queue.length-1}return loopEnv.hasOwnProperty("returns")?loopEnv.returns:resultsArray}genData.spawn=function spawn(){var parentFunction=this,curriedArgs=protoSliceMethod.call(arguments).filter(filterFunctions);function spawnedFunction(stuff){if(this instanceof spawnedFunction){return this}return parentFunction.apply(typeof this==="function"?this:spawnedFunction,[stuff].concat(curriedArgs,protoSliceMethod.call(arguments).slice(1)))}spawnedFunction.prototype=new parentFunction;spawnedFunction.spawn=spawn;return spawnedFunction};genData.version="3.1.0";return genData}if(inAMD){define(initGenData)}else if(inCJS){module.exports=initGenData()}else if(!scope.genData){scope.genData=initGenData()}}(typeof exports!="undefined",typeof define=="function",Array,this);